"""HA-IR v0.2 reference implementation.
Finite Fourier and spherical-harmonic intermediate representation with
canonical algebraic operations and NumPy/SciPy lowering paths.
"""
from dataclasses import dataclass
from collections import defaultdict
from functools import lru_cache
import math
import numpy as np
from scipy.special import sph_harm_y
from sympy.physics.wigner import wigner_3j

@dataclass
class FourierIR:
    coeffs: dict
    tol: float = 0.0
    def __post_init__(self):
        d=defaultdict(complex)
        for k,v in self.coeffs.items(): d[int(k)] += complex(v)
        self.coeffs={k:v for k,v in d.items() if abs(v)>self.tol}
    def __add__(self,other):
        d=defaultdict(complex)
        for k,v in self.coeffs.items(): d[k]+=v
        for k,v in other.coeffs.items(): d[k]+=v
        return FourierIR(dict(d),max(self.tol,other.tol))
    def __mul__(self,other):
        d=defaultdict(complex)
        for k,a in self.coeffs.items():
            for j,b in other.coeffs.items(): d[k+j]+=a*b
        return FourierIR(dict(d),max(self.tol,other.tol))
    def diff(self,order=1):
        return FourierIR({k:c*(1j*k)**order for k,c in self.coeffs.items()},self.tol)
    def trunc(self,K):
        return FourierIR({k:c for k,c in self.coeffs.items() if abs(k)<=K},self.tol)
    def eval_direct(self,x):
        x=np.asarray(x,dtype=float); y=np.zeros_like(x,dtype=np.complex128)
        for k,c in self.coeffs.items(): y += c*np.exp(1j*k*x)
        return y
    def lower_dense(self):
        if not self.coeffs: return np.array([0j],dtype=np.complex128),0
        lo,hi=min(self.coeffs),max(self.coeffs); a=np.zeros(hi-lo+1,dtype=np.complex128)
        for k,c in self.coeffs.items(): a[k-lo]=c
        return a,lo
    @staticmethod
    def from_dense(a,offset,tol=0.0):
        return FourierIR({offset+i:complex(v) for i,v in enumerate(a) if abs(v)>tol},tol)
    def mul_dense_backend(self,other):
        a,oa=self.lower_dense(); b,ob=other.lower_dense()
        return FourierIR.from_dense(np.convolve(a,b),oa+ob,tol=1e-14)
    def eval_fft_uniform(self,N):
        if self.coeffs and max(abs(k) for k in self.coeffs)>=N//2: raise ValueError('aliasing')
        bins=np.zeros(N,dtype=np.complex128)
        for k,c in self.coeffs.items(): bins[k%N]+=c
        return N*np.fft.ifft(bins)
    def serialize(self,digits=4):
        def fmt(z):
            a=round(z.real,digits); b=round(z.imag,digits); eps=10**(-digits)
            if abs(b)<eps: return f'{a:g}'
            if abs(a)<eps: return f'{b:g}j'
            return f"{a:g}{'+' if b>=0 else ''}{b:g}j"
        return 'F{'+','.join(f'{k}={fmt(self.coeffs[k])}' for k in sorted(self.coeffs))+'}'
    def explicit_formula(self,digits=4):
        def fmt(z):
            a=round(z.real,digits); b=round(z.imag,digits); eps=10**(-digits)
            if abs(b)<eps: return f'({a:g})'
            if abs(a)<eps: return f'({b:g}j)'
            return f"({a:g}{'+' if b>=0 else ''}{b:g}j)"
        return ' + '.join(f'{fmt(self.coeffs[k])}*exp(1j*({k})*x)' for k in sorted(self.coeffs)) or '0'

@lru_cache(None)
def gaunt_coupling(l1,m1,l2,m2,L,M):
    if M != m1+m2 or abs(M)>L: return 0.0
    pref=(-1)**M*math.sqrt((2*l1+1)*(2*l2+1)*(2*L+1)/(4*math.pi))
    return pref*float(wigner_3j(l1,l2,L,0,0,0))*float(wigner_3j(l1,l2,L,m1,m2,-M))

@dataclass
class SphericalIR:
    coeffs: dict
    def trunc(self,L):
        return SphericalIR({(l,m):c for (l,m),c in self.coeffs.items() if l<=L})
    def eval_scipy(self,theta,phi):
        theta=np.asarray(theta,dtype=float); phi=np.asarray(phi,dtype=float)
        y=np.zeros(np.broadcast(theta,phi).shape,dtype=np.complex128)
        for (l,m),c in self.coeffs.items(): y += c*sph_harm_y(l,m,theta,phi)
        return y
    def __mul__(self,other):
        d=defaultdict(complex)
        for (l1,m1),c1 in self.coeffs.items():
            for (l2,m2),c2 in other.coeffs.items():
                M=m1+m2
                for L in range(abs(l1-l2),l1+l2+1):
                    q=gaunt_coupling(l1,m1,l2,m2,L,M)
                    if q: d[(L,M)] += c1*c2*q
        return SphericalIR({k:v for k,v in d.items() if abs(v)>1e-14})
