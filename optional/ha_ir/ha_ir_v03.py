"""HA-IR v0.3 reference implementation.

Adds to v0.2:
- multidimensional finite Fourier coefficient maps and FFT lowering,
- JAX-differentiable 1-D Fourier lowering,
- explicit complex <-> real spherical-harmonic coefficient conventions,
- numerically verified coefficient-space spherical rotations,
- a low-degree O(3) irrep tensor-product interface using Clebsch-Gordan coupling.

The spherical rotation lowering computes the representation matrix from sampled
spherical harmonics and a least-squares projection. It is a correctness-first
reference implementation, not a production rotation kernel.
"""
from dataclasses import dataclass
from collections import defaultdict
from functools import lru_cache
import math
import numpy as np
from scipy.special import sph_harm_y
from scipy.spatial.transform import Rotation
from sympy.physics.wigner import wigner_3j, clebsch_gordan

SQRT2 = math.sqrt(2.0)

@dataclass
class FourierIR:
    coeffs: dict
    tol: float = 0.0

    def __post_init__(self):
        d = defaultdict(complex)
        for k, v in self.coeffs.items():
            d[int(k)] += complex(v)
        self.coeffs = {k: v for k, v in d.items() if abs(v) > self.tol}

    def __add__(self, other):
        d = defaultdict(complex)
        for k, v in self.coeffs.items(): d[k] += v
        for k, v in other.coeffs.items(): d[k] += v
        return FourierIR(dict(d), max(self.tol, other.tol))

    def __mul__(self, other):
        d = defaultdict(complex)
        for k, a in self.coeffs.items():
            for j, b in other.coeffs.items():
                d[k + j] += a * b
        return FourierIR(dict(d), max(self.tol, other.tol))

    def diff(self, order=1):
        return FourierIR(
            {k: c * (1j * k) ** order for k, c in self.coeffs.items()},
            self.tol,
        )

    def trunc(self, K):
        return FourierIR(
            {k: c for k, c in self.coeffs.items() if abs(k) <= K},
            self.tol,
        )

    def eval_direct(self, x):
        x = np.asarray(x, dtype=float)
        y = np.zeros_like(x, dtype=np.complex128)
        for k, c in self.coeffs.items():
            y += c * np.exp(1j * k * x)
        return y

    def lower_dense(self):
        if not self.coeffs:
            return np.array([0j], dtype=np.complex128), 0
        lo, hi = min(self.coeffs), max(self.coeffs)
        a = np.zeros(hi - lo + 1, dtype=np.complex128)
        for k, c in self.coeffs.items():
            a[k - lo] = c
        return a, lo

    @staticmethod
    def from_dense(a, offset, tol=0.0):
        return FourierIR(
            {offset + i: complex(v) for i, v in enumerate(a) if abs(v) > tol},
            tol,
        )

    def mul_dense_backend(self, other):
        a, oa = self.lower_dense()
        b, ob = other.lower_dense()
        return FourierIR.from_dense(np.convolve(a, b), oa + ob, tol=1e-14)

    def eval_fft_uniform(self, N):
        if self.coeffs and max(abs(k) for k in self.coeffs) >= N // 2:
            raise ValueError("aliasing")
        bins = np.zeros(N, dtype=np.complex128)
        for k, c in self.coeffs.items():
            bins[k % N] += c
        return N * np.fft.ifft(bins)

    def jax_payload(self):
        ks = np.asarray(sorted(self.coeffs), dtype=np.float64)
        cs = np.asarray([self.coeffs[int(k)] for k in ks], dtype=np.complex128)
        return ks, cs

    @staticmethod
    def eval_jax(ks, coeff_re, coeff_im, x):
        import jax.numpy as jnp
        ks = jnp.asarray(ks)
        coeffs = jnp.asarray(coeff_re) + 1j * jnp.asarray(coeff_im)
        return jnp.sum(coeffs * jnp.exp(1j * ks * x))


@dataclass
class MultiFourierIR:
    """Finite d-dimensional Fourier expansion sum_k c_k exp(i k dot x)."""
    coeffs: dict
    tol: float = 0.0

    def __post_init__(self):
        d = defaultdict(complex)
        dims = set()
        for k, v in self.coeffs.items():
            kk = tuple(int(x) for x in k)
            dims.add(len(kk))
            d[kk] += complex(v)
        if len(dims) > 1:
            raise ValueError("inconsistent frequency dimensions")
        self.ndim = next(iter(dims), 0)
        self.coeffs = {k: v for k, v in d.items() if abs(v) > self.tol}

    def __add__(self, other):
        if self.ndim != other.ndim:
            raise ValueError("dimension mismatch")
        d = defaultdict(complex)
        for k, v in self.coeffs.items(): d[k] += v
        for k, v in other.coeffs.items(): d[k] += v
        return MultiFourierIR(dict(d), max(self.tol, other.tol))

    def __mul__(self, other):
        if self.ndim != other.ndim:
            raise ValueError("dimension mismatch")
        d = defaultdict(complex)
        for ka, a in self.coeffs.items():
            for kb, b in other.coeffs.items():
                k = tuple(x + y for x, y in zip(ka, kb))
                d[k] += a * b
        return MultiFourierIR(dict(d), max(self.tol, other.tol))

    def trunc_box(self, K):
        if isinstance(K, int):
            K = (K,) * self.ndim
        K = tuple(int(x) for x in K)
        return MultiFourierIR(
            {k: c for k, c in self.coeffs.items()
             if all(abs(ki) <= bi for ki, bi in zip(k, K))},
            self.tol,
        )

    def eval_direct(self, x):
        x = np.asarray(x, dtype=float)
        if x.shape[-1] != self.ndim:
            raise ValueError("last coordinate dimension mismatch")
        y = np.zeros(x.shape[:-1], dtype=np.complex128)
        for k, c in self.coeffs.items():
            phase = sum(k[d] * x[..., d] for d in range(self.ndim))
            y += c * np.exp(1j * phase)
        return y

    def eval_fftn_uniform(self, shape):
        shape = tuple(int(n) for n in shape)
        if len(shape) != self.ndim:
            raise ValueError("shape dimension mismatch")
        bins = np.zeros(shape, dtype=np.complex128)
        for k, c in self.coeffs.items():
            if any(abs(ki) >= n // 2 for ki, n in zip(k, shape)):
                raise ValueError("aliasing")
            bins[tuple(ki % n for ki, n in zip(k, shape))] += c
        return int(np.prod(shape)) * np.fft.ifftn(bins)


@lru_cache(None)
def gaunt_coupling(l1, m1, l2, m2, L, M):
    if M != m1 + m2 or abs(M) > L:
        return 0.0
    pref = (-1) ** M * math.sqrt(
        (2*l1+1) * (2*l2+1) * (2*L+1) / (4*math.pi)
    )
    return (
        pref
        * float(wigner_3j(l1, l2, L, 0, 0, 0))
        * float(wigner_3j(l1, l2, L, m1, m2, -M))
    )


def _ang_to_cart(theta, phi):
    theta = np.asarray(theta)
    phi = np.asarray(phi)
    st = np.sin(theta)
    return np.stack(
        [st*np.cos(phi), st*np.sin(phi), np.cos(theta)],
        axis=-1,
    )


def _cart_to_ang(v):
    v = np.asarray(v)
    r = np.linalg.norm(v, axis=-1)
    theta = np.arccos(np.clip(v[..., 2] / r, -1.0, 1.0))
    phi = np.mod(np.arctan2(v[..., 1], v[..., 0]), 2*np.pi)
    return theta, phi


@lru_cache(None)
def _rotation_projection_grid(l):
    ntheta = max(4, 2*l + 3)
    nphi = max(8, 4*l + 6)
    z, _ = np.polynomial.legendre.leggauss(ntheta)
    theta = np.arccos(z)
    phi = np.linspace(0, 2*np.pi, nphi, endpoint=False)
    th, ph = np.meshgrid(theta, phi, indexing="ij")
    th = th.ravel()
    ph = ph.ravel()
    A = np.stack(
        [sph_harm_y(l, m, th, ph) for m in range(-l, l+1)],
        axis=-1,
    )
    return th, ph, np.linalg.pinv(A)


def spherical_rotation_matrix(l, rotation):
    """Numerically compute complex Y_l^m coefficient rotation matrix.

    Returned D satisfies coeff_rot = D @ coeff for
    f_rot(x) = f(R^{-1} x).
    """
    if not isinstance(rotation, Rotation):
        rotation = Rotation.from_matrix(np.asarray(rotation, dtype=float))
    th, ph, pinvA = _rotation_projection_grid(int(l))
    xyz = _ang_to_cart(th, ph)
    xyz_in = rotation.apply(xyz, inverse=True)
    th2, ph2 = _cart_to_ang(xyz_in)
    B = np.stack(
        [sph_harm_y(l, m, th2, ph2) for m in range(-l, l+1)],
        axis=-1,
    )
    return pinvA @ B


def complex_to_real_coeffs(coeffs):
    """Complex Y_l^m coefficients -> defined orthonormal real tesseral basis.

    R_l0 = Y_l0
    R_lm = [(-1)^m Y_lm + Y_l,-m]/sqrt(2), m>0
    R_l,-m = [(-1)^m Y_lm - Y_l,-m]/(i sqrt(2)), m>0
    """
    if not coeffs:
        return {}
    Lmax = max(l for l, m in coeffs)
    out = {}
    for l in range(Lmax + 1):
        out[(l, 0)] = complex(coeffs.get((l, 0), 0.0))
        for m in range(1, l + 1):
            cp = complex(coeffs.get((l, m), 0.0))
            cn = complex(coeffs.get((l, -m), 0.0))
            out[(l, m)] = (((-1)**m) * cp + cn) / SQRT2
            out[(l, -m)] = 1j * (((-1)**m) * cp - cn) / SQRT2
    return out


def real_to_complex_coeffs(coeffs):
    """Inverse of complex_to_real_coeffs for the defined real basis."""
    if not coeffs:
        return {}
    Lmax = max(l for l, m in coeffs)
    out = {}
    for l in range(Lmax + 1):
        out[(l, 0)] = complex(coeffs.get((l, 0), 0.0))
        for m in range(1, l + 1):
            rp = complex(coeffs.get((l, m), 0.0))
            rn = complex(coeffs.get((l, -m), 0.0))
            out[(l, m)] = ((-1)**m) * (rp - 1j*rn) / SQRT2
            out[(l, -m)] = (rp + 1j*rn) / SQRT2
    return out


@dataclass
class SphericalIR:
    coeffs: dict
    basis: str = "complex"

    def __post_init__(self):
        if self.basis not in {"complex", "real"}:
            raise ValueError("basis must be 'complex' or 'real'")
        self.coeffs = {
            (int(l), int(m)): complex(c)
            for (l, m), c in self.coeffs.items()
            if abs(c) > 0
        }

    def trunc(self, L):
        return SphericalIR(
            {(l, m): c for (l, m), c in self.coeffs.items() if l <= L},
            self.basis,
        )

    def as_complex(self):
        if self.basis == "complex":
            return self
        return SphericalIR(real_to_complex_coeffs(self.coeffs), "complex")

    def as_real(self):
        if self.basis == "real":
            return self
        return SphericalIR(complex_to_real_coeffs(self.coeffs), "real")

    def eval_scipy(self, theta, phi):
        obj = self.as_complex()
        theta = np.asarray(theta, dtype=float)
        phi = np.asarray(phi, dtype=float)
        y = np.zeros(np.broadcast(theta, phi).shape, dtype=np.complex128)
        for (l, m), c in obj.coeffs.items():
            y += c * sph_harm_y(l, m, theta, phi)
        return y

    def __mul__(self, other):
        a = self.as_complex()
        b = other.as_complex()
        d = defaultdict(complex)
        for (l1, m1), c1 in a.coeffs.items():
            for (l2, m2), c2 in b.coeffs.items():
                M = m1 + m2
                for L in range(abs(l1-l2), l1+l2+1):
                    q = gaunt_coupling(l1, m1, l2, m2, L, M)
                    if q:
                        d[(L, M)] += c1 * c2 * q
        return SphericalIR(
            {k: v for k, v in d.items() if abs(v) > 1e-14},
            "complex",
        )

    def rotate(self, rotation):
        obj = self.as_complex()
        if not obj.coeffs:
            return SphericalIR({}, "complex")
        Lmax = max(l for l, m in obj.coeffs)
        out = {}
        for l in range(Lmax + 1):
            c = np.array(
                [obj.coeffs.get((l, m), 0.0) for m in range(-l, l+1)],
                dtype=np.complex128,
            )
            if np.any(c):
                D = spherical_rotation_matrix(l, rotation)
                cr = D @ c
                for m, value in zip(range(-l, l+1), cr):
                    if abs(value) > 1e-14:
                        out[(l, m)] = complex(value)
        return SphericalIR(out, "complex")


@lru_cache(None)
def cg_coupling(l1, m1, l2, m2, L, M):
    if M != m1 + m2 or abs(M) > L:
        return 0.0
    return float(clebsch_gordan(l1, l2, L, m1, m2, M))


@dataclass
class O3Irrep:
    """Single O(3) irrep block (l, parity) in a complex m basis.

    parity is the inversion eigenvalue +1 or -1.
    """
    l: int
    parity: int
    coeffs: np.ndarray

    def __post_init__(self):
        self.l = int(self.l)
        self.parity = int(self.parity)
        if self.parity not in (-1, 1):
            raise ValueError("parity must be ±1")
        self.coeffs = np.asarray(self.coeffs, dtype=np.complex128)
        if self.coeffs.shape != (2*self.l + 1,):
            raise ValueError("coeff shape mismatch")

    def rotate(self, rotation):
        return O3Irrep(
            self.l,
            self.parity,
            spherical_rotation_matrix(self.l, rotation) @ self.coeffs,
        )

    def invert(self):
        return O3Irrep(self.l, self.parity, self.parity * self.coeffs)

    def tensor_product(self, other):
        outputs = {}
        pout = self.parity * other.parity
        for L in range(abs(self.l-other.l), self.l+other.l+1):
            z = np.zeros(2*L + 1, dtype=np.complex128)
            for i, m1 in enumerate(range(-self.l, self.l+1)):
                for j, m2 in enumerate(range(-other.l, other.l+1)):
                    M = m1 + m2
                    if abs(M) <= L:
                        q = cg_coupling(self.l, m1, other.l, m2, L, M)
                        if q:
                            z[M + L] += self.coeffs[i] * other.coeffs[j] * q
            outputs[(L, pout)] = O3Irrep(L, pout, z)
        return outputs
