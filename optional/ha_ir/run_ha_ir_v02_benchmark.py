from pathlib import Path
from dataclasses import dataclass
from collections import defaultdict
from functools import lru_cache
import json, math, statistics, time, platform, sys
import numpy as np
import pandas as pd
import sympy as sp
from scipy.special import sph_harm_y
from sympy.physics.wigner import wigner_3j

OUT = Path(__file__).resolve().parent
SEED = 2026081902
rng = np.random.default_rng(SEED)

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

def random_fourier(n_modes,freq_limit):
    ks=rng.choice(np.arange(-freq_limit,freq_limit+1),size=n_modes,replace=False)
    cs=rng.normal(size=n_modes)+1j*rng.normal(size=n_modes)
    return FourierIR({int(k):complex(c) for k,c in zip(ks,cs)})

def random_dense_fourier(K):
    ks=np.arange(-K,K+1); cs=rng.normal(size=len(ks))+1j*rng.normal(size=len(ks))
    return FourierIR({int(k):complex(c) for k,c in zip(ks,cs)})

def random_spherical(L,n_modes):
    lm=[(l,m) for l in range(L+1) for m in range(-l,l+1)]
    chosen=rng.choice(len(lm),size=n_modes,replace=False)
    return SphericalIR({lm[int(i)]:complex(rng.normal(),rng.normal()) for i in chosen})

def medtime(fn,repeats):
    vals=[]
    for _ in range(repeats):
        t=time.perf_counter(); fn(); vals.append(time.perf_counter()-t)
    return float(statistics.median(vals))

rows=[]
# Fourier product and dense lowering
for t in range(100):
    f=random_fourier(12,32); g=random_fourier(12,32); h=f*g
    x=rng.uniform(-math.pi,math.pi,257)
    rows.append(('fourier_product',t,'pointwise_max_abs_error',float(np.max(np.abs(h.eval_direct(x)-f.eval_direct(x)*g.eval_direct(x))))))
    hd=f.mul_dense_backend(g); ks=set(h.coeffs)|set(hd.coeffs)
    rows.append(('fourier_product',t,'dense_lowering_coeff_max_abs_error',float(max([abs(h.coeffs.get(k,0)-hd.coeffs.get(k,0)) for k in ks] or [0]))))
    rows.append(('fourier_product',t,'raw_pairwise_terms',len(f.coeffs)*len(g.coeffs)))
    rows.append(('fourier_product',t,'canonical_output_modes',len(h.coeffs)))

# Fourier derivative vs independent symbolic differentiation
xsp=sp.symbols('x',real=True)
for t in range(25):
    f=random_fourier(6,8)
    expr=sum((sp.Float(c.real,17)+sp.I*sp.Float(c.imag,17))*sp.exp(sp.I*k*xsp) for k,c in f.coeffs.items())
    dref=sp.lambdify(xsp,sp.diff(expr,xsp),'numpy'); x=rng.uniform(-math.pi,math.pi,41)
    rows.append(('fourier_derivative',t,'sympy_crosscheck_max_abs_error',float(np.max(np.abs(f.diff().eval_direct(x)-np.asarray(dref(x),dtype=np.complex128))))))

# Spherical evaluation: SciPy vs SymPy
thsp,phsp=sp.symbols('theta phi',real=True)
for t in range(12):
    s=random_spherical(4,8)
    expr=sum((sp.Float(c.real,17)+sp.I*sp.Float(c.imag,17))*sp.functions.special.spherical_harmonics.Ynm(l,m,thsp,phsp) for (l,m),c in s.coeffs.items())
    es=[]
    for _ in range(8):
        th=float(rng.uniform(.1,math.pi-.1)); ph=float(rng.uniform(0,2*math.pi))
        es.append(abs(complex(s.eval_scipy(th,ph))-complex(sp.N(expr.subs({thsp:th,phsp:ph}),17))))
    rows.append(('spherical_backend',t,'scipy_vs_sympy_max_abs_error',float(max(es))))

# Spherical product via Wigner/Gaunt coupling vs pointwise product
for t in range(30):
    a=random_spherical(2,4); b=random_spherical(2,4); h=a*b
    th=rng.uniform(.1,math.pi-.1,97); ph=rng.uniform(0,2*math.pi,97)
    err=float(np.max(np.abs(h.eval_scipy(th,ph)-a.eval_scipy(th,ph)*b.eval_scipy(th,ph))))
    rows.append(('spherical_product',t,'pointwise_max_abs_error',err))

# Compactness vs explicit expanded formula
for t in range(100):
    f=random_fourier(20,100); ha=f.serialize(); ex=f.explicit_formula()
    rows += [('compactness',t,'ha_characters',len(ha)),('compactness',t,'explicit_formula_characters',len(ex)),('compactness',t,'ha_to_explicit_character_ratio',len(ha)/len(ex))]

# FFT lowering on uniform grid
for t in range(20):
    f=random_fourier(128,512); N=8192; x=2*math.pi*np.arange(N)/N
    direct=f.eval_direct(x); fast=f.eval_fft_uniform(N)
    f.eval_direct(x); f.eval_fft_uniform(N)
    td=medtime(lambda:f.eval_direct(x),3); tf=medtime(lambda:f.eval_fft_uniform(N),7)
    rows += [('fft_lowering',t,'max_abs_error',float(np.max(np.abs(direct-fast)))),('fft_lowering',t,'direct_seconds',td),('fft_lowering',t,'fft_seconds',tf),('fft_lowering',t,'speedup',td/tf)]

# Dense convolution lowering
for t in range(20):
    f=random_dense_fourier(128); g=random_dense_fourier(128); s=f*g; d=f.mul_dense_backend(g); ks=set(s.coeffs)|set(d.coeffs)
    err=float(max([abs(s.coeffs.get(k,0)-d.coeffs.get(k,0)) for k in ks] or [0]))
    f*g; f.mul_dense_backend(g)
    ts=medtime(lambda:f*g,3); td=medtime(lambda:f.mul_dense_backend(g),7)
    rows += [('dense_convolution_lowering',t,'coeff_max_abs_error',err),('dense_convolution_lowering',t,'sparse_seconds',ts),('dense_convolution_lowering',t,'dense_seconds',td),('dense_convolution_lowering',t,'speedup',ts/td)]

trials=pd.DataFrame(rows,columns=['experiment','trial','metric','value'])
def V(e,m): return trials[(trials.experiment==e)&(trials.metric==m)].value.to_numpy()
summary=pd.DataFrame([
    ['Fourier product semantic equivalence',float(np.max(V('fourier_product','pointwise_max_abs_error'))),'max error <= 1e-10',float(np.max(V('fourier_product','pointwise_max_abs_error')))<=1e-10],
    ['Sparse to dense convolution lowering',float(np.max(V('fourier_product','dense_lowering_coeff_max_abs_error'))),'max coefficient error <= 1e-12',float(np.max(V('fourier_product','dense_lowering_coeff_max_abs_error')))<=1e-12],
    ['HA derivative vs SymPy derivative',float(np.max(V('fourier_derivative','sympy_crosscheck_max_abs_error'))),'max error <= 1e-10',float(np.max(V('fourier_derivative','sympy_crosscheck_max_abs_error')))<=1e-10],
    ['Spherical evaluation SciPy vs SymPy',float(np.max(V('spherical_backend','scipy_vs_sympy_max_abs_error'))),'max error <= 1e-10',float(np.max(V('spherical_backend','scipy_vs_sympy_max_abs_error')))<=1e-10],
    ['Spherical product via Wigner/Gaunt coupling',float(np.max(V('spherical_product','pointwise_max_abs_error'))),'max error <= 1e-10',float(np.max(V('spherical_product','pointwise_max_abs_error')))<=1e-10],
    ['Surface-notation compactness',float(np.median(V('compactness','ha_to_explicit_character_ratio'))),'median HA/expanded characters <= 0.60',float(np.median(V('compactness','ha_to_explicit_character_ratio')))<=.60],
    ['Uniform-grid FFT lowering speedup',float(np.median(V('fft_lowering','speedup'))),'median speedup >= 5x',float(np.median(V('fft_lowering','speedup')))>=5],
    ['Dense coefficient-convolution lowering speedup',float(np.median(V('dense_convolution_lowering','speedup'))),'median speedup >= 5x',float(np.median(V('dense_convolution_lowering','speedup')))>=5],
],columns=['Test','Observed','Criterion','Pass'])
raw=V('fourier_product','raw_pairwise_terms'); can=V('fourier_product','canonical_output_modes')
meta={
 'seed':SEED,'all_confirmatory_tests_passed':bool(summary.Pass.all()),
 'median_product_canonicalization_ratio':float(np.median(can/raw)),
 'median_HA_character_ratio':float(np.median(V('compactness','ha_to_explicit_character_ratio'))),
 'median_fft_speedup':float(np.median(V('fft_lowering','speedup'))),
 'median_dense_convolution_speedup':float(np.median(V('dense_convolution_lowering','speedup'))),
 'max_fft_lowering_error':float(np.max(V('fft_lowering','max_abs_error'))),
 'max_spherical_product_error':float(np.max(V('spherical_product','pointwise_max_abs_error'))),
 'python':sys.version.split()[0],'platform':platform.platform(),
 'numpy':np.__version__,'sympy':sp.__version__
}
try:
 import scipy; meta['scipy']=scipy.__version__
except Exception: pass
summary.to_csv(OUT/'ha_ir_v02_benchmark_summary.csv',index=False)
trials.to_csv(OUT/'ha_ir_v02_benchmark_trials.csv',index=False)
(OUT/'ha_ir_v02_benchmark_summary.json').write_text(json.dumps(meta,indent=2))
print(summary.to_string(index=False))
print(json.dumps(meta,indent=2))
