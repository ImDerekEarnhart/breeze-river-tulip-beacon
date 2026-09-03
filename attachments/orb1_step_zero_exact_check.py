from fractions import Fraction as F
import random, json, hashlib

SEED=20260819
R=random.Random(SEED)

class GQ:
    __slots__=('a','b')
    def __init__(self,a=0,b=0): self.a=F(a); self.b=F(b)
    def __add__(self,o): o=co(o); return GQ(self.a+o.a,self.b+o.b)
    __radd__=__add__
    def __neg__(self): return GQ(-self.a,-self.b)
    def __sub__(self,o): return self+(-co(o))
    def __mul__(self,o):
        o=co(o); return GQ(self.a*o.a-self.b*o.b,self.a*o.b+self.b*o.a)
    __rmul__=__mul__
    def __eq__(self,o): o=co(o); return self.a==o.a and self.b==o.b
    def __hash__(self): return hash((self.a,self.b))
    def conj(self): return GQ(self.a,-self.b)
    def iszero(self): return self.a==0 and self.b==0
    def pair(self): return (str(self.a),str(self.b))
    def __repr__(self): return f'GQ({self.a},{self.b})'
def co(x): return x if isinstance(x,GQ) else GQ(x,0)
I=GQ(0,1)

class State:
    def __init__(self,c=None,d=2):
        self.d=d
        z={}
        if c:
            for k,v in c.items():
                k=tuple(k); v=co(v)
                if len(k)!=d: raise ValueError('bad key dimension')
                if not v.iszero(): z[k]=z.get(k,GQ())+v
        self.c={k:v for k,v in z.items() if not v.iszero()}
    @staticmethod
    def zero(d=2): return State({},d)
    @staticmethod
    def one(d=2): return State({(0,)*d:GQ(1)},d)
    def __add__(self,o):
        assert self.d==o.d
        z=dict(self.c)
        for k,v in o.c.items(): z[k]=z.get(k,GQ())+v
        return State(z,self.d)
    def __neg__(self): return State({k:-v for k,v in self.c.items()},self.d)
    def __sub__(self,o): return self+(-o)
    def __mul__(self,o):
        assert self.d==o.d
        z={}
        for k,a in self.c.items():
            for j,b in o.c.items():
                q=tuple(x+y for x,y in zip(k,j))
                z[q]=z.get(q,GQ())+a*b
        return State(z,self.d)
    def star(self):
        return State({tuple(-x for x in k):v.conj() for k,v in self.c.items()},self.d)
    def is_real(self): return self==self.star()
    def __eq__(self,o): return isinstance(o,State) and self.d==o.d and self.c==o.c
    def serial(self):
        return [(k,self.c[k].pair()) for k in sorted(self.c)]

def rand_gq(): return GQ(F(R.randint(-4,4),R.randint(1,4)),F(R.randint(-4,4),R.randint(1,4)))
def rand_state(d=2,max_terms=6):
    z={}
    for _ in range(R.randint(0,max_terms)):
        k=tuple(R.randint(-3,3) for _ in range(d)); z[k]=z.get(k,GQ())+rand_gq()
    return State(z,d)
def rand_real_state(d=2,max_pairs=4):
    z={(0,)*d:GQ(F(R.randint(-4,4),R.randint(1,4)),0)}
    for _ in range(R.randint(0,max_pairs)):
        k=None
        while k is None or all(x==0 for x in k): k=tuple(R.randint(-3,3) for _ in range(d))
        # canonicalize pair collision by accumulation
        a=rand_gq(); nk=tuple(-x for x in k)
        z[k]=z.get(k,GQ())+a; z[nk]=z.get(nk,GQ())+a.conj()
    return State(z,d)

def basis_cos(n,d=1):
    k=(n,)+(0,)*(d-1); nk=tuple(-x for x in k)
    return State({k:GQ(F(1,2)),nk:GQ(F(1,2))},d)
def basis_sin(n,d=1):
    k=(n,)+(0,)*(d-1); nk=tuple(-x for x in k)
    return State({k:GQ(0,F(-1,2)),nk:GQ(0,F(1,2))},d)

def check(cond,name,failures):
    if not cond: failures.append(name)

fail=[]; N=1000; d=2
Z=State.zero(d); O=State.one(d)
for i in range(N):
    a,b,c=rand_state(d),rand_state(d),rand_state(d)
    check(a+b==b+a,f'add_comm_{i}',fail)
    check((a+b)+c==a+(b+c),f'add_assoc_{i}',fail)
    check(a+Z==a and Z+a==a,f'add_zero_{i}',fail)
    check(a+(-a)==Z,f'add_inv_{i}',fail)
    check(a*b==b*a,f'mul_comm_{i}',fail)
    check((a*b)*c==a*(b*c),f'mul_assoc_{i}',fail)
    check(a*O==a and O*a==a,f'mul_one_{i}',fail)
    check(a*(b+c)==a*b+a*c,f'left_dist_{i}',fail)
    check((a+b)*c==a*c+b*c,f'right_dist_{i}',fail)

for i in range(N):
    a,b=rand_real_state(d),rand_real_state(d)
    check(a.is_real(),f'real_gen_a_{i}',fail)
    check(b.is_real(),f'real_gen_b_{i}',fail)
    check((a+b).is_real(),f'real_add_{i}',fail)
    check((a*b).is_real(),f'real_mul_{i}',fail)

# canonical equality / zero
x=rand_state(d)
check((x-x)==Z,'canonical_zero',fail)
check((x-x).serial()==[],'canonical_zero_serial',fail)
check(O.serial()==[((0,0),('1','0'))],'canonical_one',fail)

# Archived mixed-order regression without phases: cos(t)*sin(2t)=1/2(sin(3t)+sin(t))
c1=basis_cos(1,1); s2=basis_sin(2,1)
expected=State({(3,):GQ(0,F(-1,4)),(-3,):GQ(0,F(1,4)),(1,):GQ(0,F(-1,4)),(-1,):GQ(0,F(1,4))},1)
check(c1*s2==s2*c1,'regression_mixed_order_commutativity',fail)
check(c1*s2==expected,'regression_mixed_order_formula',fail)

# Zero-frequency preservation regression: sin(t+pi/2)*cos(t)=cos^2(t)=1/2 + 1/2 cos(2t)
# In exact coefficient form sin(t+pi/2) imports to cos(t).
prod=c1*c1
expected2=State({(0,):GQ(F(1,2)),(2,):GQ(F(1,4)),(-2,):GQ(F(1,4))},1)
check(prod==expected2,'regression_zero_frequency_preserved',fail)
check(prod.c.get((0,),GQ())==GQ(F(1,2)),'unit_frequency_coefficient_half',fail)

result={
 'schema':'orb1-step-zero-exact-check/1',
 'seed':SEED,
 'random_ring_cases':N,
 'random_real_invariant_cases':N,
 'coefficient_domain':'Gaussian rationals Q(i)',
 'frequency_group':'Z^2 for randomized tests; Z for regressions',
 'exact_arithmetic':True,
 'tolerance_used':False,
 'failure_count':len(fail),
 'failures':fail[:50],
 'mixed_regression_product':(c1*s2).serial(),
 'zero_frequency_regression_product':prod.serial(),
 'verdict':'SURVIVED_IMPLEMENTATION_FALSIFICATION' if not fail else 'REFUTED'
}
print(json.dumps(result,sort_keys=True,indent=2))
