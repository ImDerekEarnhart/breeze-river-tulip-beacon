
from fractions import Fraction as F
import random, json, hashlib

SEED = 20260820
R = random.Random(SEED)

class GQ:
    __slots__ = ("a","b")
    def __init__(self,a=0,b=0):
        self.a = F(a)
        self.b = F(b)
    def __add__(self,o):
        o = co(o); return GQ(self.a+o.a,self.b+o.b)
    __radd__ = __add__
    def __neg__(self): return GQ(-self.a,-self.b)
    def __sub__(self,o): return self + (-co(o))
    def __mul__(self,o):
        o = co(o)
        return GQ(self.a*o.a-self.b*o.b, self.a*o.b+self.b*o.a)
    __rmul__ = __mul__
    def __truediv__(self,o):
        o = co(o)
        den = o.a*o.a + o.b*o.b
        if den == 0: raise ZeroDivisionError
        return GQ((self.a*o.a+self.b*o.b)/den, (self.b*o.a-self.a*o.b)/den)
    def inv(self):
        return GQ(1) / self
    def __pow__(self,n):
        if not isinstance(n,int): raise TypeError
        if n < 0: return (self.inv()) ** (-n)
        out = GQ(1); base = self
        k = n
        while k:
            if k & 1: out = out * base
            base = base * base
            k >>= 1
        return out
    def __eq__(self,o):
        o = co(o); return self.a==o.a and self.b==o.b
    def __hash__(self): return hash((self.a,self.b))
    def conj(self): return GQ(self.a,-self.b)
    def norm2(self): return self.a*self.a + self.b*self.b
    def iszero(self): return self.a==0 and self.b==0
    def pair(self): return (str(self.a),str(self.b))
    def __repr__(self): return f"GQ({self.a},{self.b})"

def co(x): return x if isinstance(x,GQ) else GQ(x,0)
I = GQ(0,1)

class State:
    def __init__(self,c=None,d=3):
        self.d = d
        z = {}
        if c:
            for k,v in c.items():
                k = tuple(k); v = co(v)
                if len(k) != d: raise ValueError("bad key dimension")
                if not v.iszero():
                    z[k] = z.get(k,GQ()) + v
        self.c = {k:v for k,v in z.items() if not v.iszero()}
    @staticmethod
    def zero(d=3): return State({},d)
    @staticmethod
    def one(d=3): return State({(0,)*d:GQ(1)},d)
    def __add__(self,o):
        assert self.d == o.d
        z = dict(self.c)
        for k,v in o.c.items():
            z[k] = z.get(k,GQ()) + v
        return State(z,self.d)
    def __neg__(self): return State({k:-v for k,v in self.c.items()},self.d)
    def __sub__(self,o): return self + (-o)
    def __mul__(self,o):
        assert self.d == o.d
        z = {}
        for k,a in self.c.items():
            for j,b in o.c.items():
                q = tuple(x+y for x,y in zip(k,j))
                z[q] = z.get(q,GQ()) + a*b
        return State(z,self.d)
    def scalar(self,s):
        s = co(s)
        return State({k:s*v for k,v in self.c.items()},self.d)
    def star(self):
        return State({tuple(-x for x in k):v.conj() for k,v in self.c.items()},self.d)
    def is_real(self): return self == self.star()
    def __eq__(self,o): return isinstance(o,State) and self.d==o.d and self.c==o.c
    def serial(self): return [(k,self.c[k].pair()) for k in sorted(self.c)]
    def support(self): return set(self.c)

def D(a,j):
    if not (0 <= j < a.d): raise IndexError
    return State({k:(I * k[j]) * v for k,v in a.c.items()},a.d)

def Dq(a,q):
    if len(q) != a.d: raise ValueError
    out = State.zero(a.d)
    for j,x in enumerate(q):
        out = out + D(a,j).scalar(F(x))
    return out

def character(u,k):
    if len(u) != len(k): raise ValueError
    out = GQ(1)
    for uj,nj in zip(u,k):
        out = out * (uj ** nj)
    return out

def T(a,u):
    if len(u) != a.d: raise ValueError
    for uj in u:
        if uj.norm2() != 1:
            raise ValueError("translation parameter must have unit norm")
    return State({k:character(u,k)*v for k,v in a.c.items()},a.d)

def unit_phasor():
    # Rational parametrization of x^2+y^2=1:
    # x=(1-t^2)/(1+t^2), y=2t/(1+t^2), t in Q.
    p = R.randint(-5,5)
    q = R.randint(1,5)
    t = F(p,q)
    den = 1+t*t
    return GQ((1-t*t)/den, (2*t)/den)

def rand_gq():
    return GQ(F(R.randint(-4,4),R.randint(1,4)),
              F(R.randint(-4,4),R.randint(1,4)))

def rand_state(d=3,max_terms=7):
    z = {}
    for _ in range(R.randint(0,max_terms)):
        k = tuple(R.randint(-3,3) for _ in range(d))
        z[k] = z.get(k,GQ()) + rand_gq()
    return State(z,d)

def rand_real_state(d=3,max_pairs=5):
    z = {(0,)*d:GQ(F(R.randint(-4,4),R.randint(1,4)),0)}
    for _ in range(R.randint(0,max_pairs)):
        k = (0,)*d
        while all(x==0 for x in k):
            k = tuple(R.randint(-3,3) for _ in range(d))
        a = rand_gq()
        nk = tuple(-x for x in k)
        z[k] = z.get(k,GQ()) + a
        z[nk] = z.get(nk,GQ()) + a.conj()
    return State(z,d)

def check(cond,name,fail):
    if not cond:
        fail.append(name)

N = 1000
d = 3
Z = State.zero(d)
O = State.one(d)
fail = []

# Coordinate derivation tests
for i in range(N):
    a,b = rand_state(d),rand_state(d)
    j,k = R.randrange(d),R.randrange(d)
    check(D(a+b,j) == D(a,j)+D(b,j), f"D_add_{i}", fail)
    check(D(O,j) == Z, f"D_one_zero_{i}", fail)
    check(D(a*b,j) == D(a,j)*b + a*D(b,j), f"D_Leibniz_{i}", fail)
    check(D(D(a,j),k) == D(D(a,k),j), f"D_commute_{i}", fail)
    check(D(a,j).support().issubset(a.support()), f"D_support_{i}", fail)

# Real-state preservation for D
for i in range(N):
    a = rand_real_state(d)
    j = R.randrange(d)
    check(a.is_real(), f"real_gen_D_{i}", fail)
    check(D(a,j).is_real(), f"D_real_preserve_{i}", fail)

# Translation tests
for i in range(N):
    a,b = rand_state(d),rand_state(d)
    u = tuple(unit_phasor() for _ in range(d))
    v = tuple(unit_phasor() for _ in range(d))
    one_u = tuple(GQ(1) for _ in range(d))
    inv_u = tuple(x.conj() for x in u)
    uv = tuple(x*y for x,y in zip(u,v))
    check(T(a,one_u) == a, f"T_identity_{i}", fail)
    check(T(T(a,u),inv_u) == a, f"T_inverse_{i}", fail)
    check(T(T(a,u),v) == T(a,uv), f"T_comp_{i}", fail)
    check(T(a+b,u) == T(a,u)+T(b,u), f"T_add_{i}", fail)
    check(T(a*b,u) == T(a,u)*T(b,u), f"T_mul_auto_{i}", fail)
    check(T(a,u).support() == a.support(), f"T_support_{i}", fail)
    j = R.randrange(d)
    check(D(T(a,u),j) == T(D(a,j),u), f"DT_commute_{i}", fail)

# Real-state preservation for translation
for i in range(N):
    a = rand_real_state(d)
    u = tuple(unit_phasor() for _ in range(d))
    check(T(a,u).is_real(), f"T_real_preserve_{i}", fail)

# Rational directional derivations as derived family
for i in range(N):
    a,b = rand_state(d),rand_state(d)
    q = tuple(F(R.randint(-3,3), R.randint(1,4)) for _ in range(d))
    check(Dq(a+b,q) == Dq(a,q)+Dq(b,q), f"Dq_add_{i}", fail)
    check(Dq(a*b,q) == Dq(a,q)*b + a*Dq(b,q), f"Dq_Leibniz_{i}", fail)

# Concrete examples / witnesses
example_u = (GQ(F(3,5),F(4,5)), GQ(0,1), GQ(-1,0))
basis = State({(2,-1,3):GQ(F(2,3),F(-1,4))},d)
example_D = D(basis,0).serial()
example_T = T(basis,example_u).serial()

# Language-limit witnesses are symbolic facts, not floating computations.
limits = {
    "physical_derivative_sqrt2": {
        "multiplier_needed": "i*sqrt(2)*n",
        "in_Qi": False,
        "reason": "sqrt(2) is irrational, while every Q(i) element has rational real and imaginary parts"
    },
    "shift_pi_over_4": {
        "phasor_needed": "(1+i)/sqrt(2)",
        "in_Qi": False,
        "reason": "1/sqrt(2) is irrational"
    }
}

result = {
    "schema": "orb1-operator-admission-check/1",
    "seed": SEED,
    "profile": "Q(i)[Z^3]",
    "cases_per_family": N,
    "families": {
        "coordinate_derivations": [
            "additivity","unit_annihilation","Leibniz","pairwise_commutation",
            "finite_support_closure","real_state_preservation"
        ],
        "exact_translations": [
            "identity","inverse","composition","additivity","multiplicative_automorphism",
            "support_preservation","real_state_preservation","commutation_with_D"
        ],
        "rational_directional_derivations": ["additivity","Leibniz"]
    },
    "translation_parameter_domain": "u in (Q(i) unit circle)^d, exact phasors with u*conj(u)=1",
    "failure_count": len(fail),
    "failures": fail[:100],
    "tolerance_used": False,
    "example_D": example_D,
    "example_T": example_T,
    "language_limits": limits,
    "verdict": "SURVIVED_IMPLEMENTATION_FALSIFICATION" if not fail else "REFUTED"
}
print(json.dumps(result,sort_keys=True,indent=2))
