#!/usr/bin/env python3
from pathlib import Path
import csv,json,hashlib,itertools,time,math
import numpy as np
from scipy.linalg import expm,eigh
from scipy.sparse import csr_matrix,eye,kron
from scipy.sparse.linalg import expm_multiply

ROOT=Path(__file__).resolve().parent
M=json.loads((ROOT/"LOCAL_FROZEN_EXECUTION_MANIFEST.json").read_text())

def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for c in iter(lambda:f.read(1<<20),b""):h.update(c)
    return h.hexdigest()

if sha(ROOT/"FROZEN_EXACT_FIBER_PAIRS.csv")!=M["pairs_sha256"]:raise RuntimeError("pairs hash mismatch")
if sha(ROOT/"FROZEN_RECOVERY_TRIPLETS.csv")!=M["triplets_sha256"]:raise RuntimeError("triplets hash mismatch")

PRIMS=M["candidate_primitives"]
td=np.arange(0,10.0001,.5)
I=np.eye(2,dtype=complex);X=np.array([[0,1],[1,0]],complex);Y=np.array([[0,-1j],[1j,0]],complex);Z=np.array([[1,0],[0,-1]],complex)

def ka_dense(ops):
    o=np.array([[1]],complex)
    for a in ops:o=np.kron(o,a)
    return o
def jw_dense(N):
    n=N//2;g=[]
    for k in range(n):
        g += [ka_dense([Z]*k+[X]+[I]*(n-k-1)),ka_dense([Z]*k+[Y]+[I]*(n-k-1))]
    return g

def dense_context(N,seed,beta=8.):
    gs=jw_dense(N);rng=np.random.default_rng(seed);std=np.sqrt(6/N**3);d=2**(N//2)
    H=np.zeros((d,d),complex);C={}
    for inds in itertools.combinations(range(N),4):
        j=float(rng.normal(0,std));C[inds]=j;P=np.eye(d,dtype=complex)
        for i in inds:P=P@gs[i]
        H+=-(1/24)*j*P
    full=jw_dense(2*N);gL=full[:N];gR=full[N:];D=d*d;Hbase=np.zeros((D,D),complex)
    for inds,j in C.items():
        PL=np.eye(D,dtype=complex);PR=np.eye(D,dtype=complex)
        for i in inds:PL=PL@gL[i];PR=PR@gR[i]
        Hbase+=-(1/24)*j*(PL+PR)
    A=expm(-beta*H/2);psi=A.flatten(order="C");psi/=np.linalg.norm(psi)
    phis=np.column_stack([gL[j]@psi for j in range(N)])
    return Hbase,[1j*(gL[j]@gR[j]) for j in range(N)],gR,np.column_stack([psi,phis])

def dense_obs(ctx,s,mu=.2):
    Hbase,coup,gR,init=ctx;Ht=Hbase.copy()
    for j,w in enumerate(s):Ht+=mu*w*coup[j]
    E,V=eigh(Ht);coef=V.conj().T@init;best=0.
    for t in td:
        st=V@(np.exp(-1j*E*t)[:,None]*coef);a=st[:,0]
        cs=[np.vdot(a,gR[j]@st[:,j+1]) for j in range(len(s))]
        best=max(best,abs(np.mean(cs)))
    return float(best)

I2s=csr_matrix(np.eye(2,dtype=complex));Xs=csr_matrix(X);Ys=csr_matrix(Y);Zs=csr_matrix(Z)
def ka_sparse(ops):
    o=csr_matrix([[1]],dtype=complex)
    for a in ops:o=kron(o,a,format="csr")
    return o
def jw_sparse(N):
    n=N//2;g=[]
    for k in range(n):
        g += [ka_sparse([Zs]*k+[Xs]+[I2s]*(n-k-1)),ka_sparse([Zs]*k+[Ys]+[I2s]*(n-k-1))]
    return g

def sparse_context(N,seed,beta=8.):
    gs=[g.toarray() for g in jw_sparse(N)];rng=np.random.default_rng(seed);std=np.sqrt(6/N**3);d=2**(N//2)
    H=np.zeros((d,d),complex);C={}
    for inds in itertools.combinations(range(N),4):
        j=float(rng.normal(0,std));C[inds]=j;P=np.eye(d,dtype=complex)
        for i in inds:P=P@gs[i]
        H+=-(1/24)*j*P
    full=jw_sparse(2*N);gL=full[:N];gR=full[N:];D=d*d;Hbase=csr_matrix((D,D),dtype=complex)
    for inds,j in C.items():
        PL=eye(D,dtype=complex,format="csr");PR=eye(D,dtype=complex,format="csr")
        for i in inds:PL=PL@gL[i];PR=PR@gR[i]
        Hbase+=(-(1/24)*j)*(PL+PR)
    A=expm(-beta*H/2);psi=A.flatten(order="C");psi/=np.linalg.norm(psi)
    phis=np.column_stack([gL[j]@psi for j in range(N)])
    return Hbase,[1j*(gL[j]@gR[j]) for j in range(N)],gR,np.column_stack([psi,phis])

def sparse_obs(ctx,s,mu=.2):
    Hbase,coup,gR,init=ctx;Ht=Hbase.copy()
    for j,w in enumerate(s):Ht=Ht+mu*w*coup[j]
    states=expm_multiply((-1j)*Ht,init,start=0,stop=10,num=21,endpoint=True)
    best=0.
    for st in states:
        a=st[:,0];cs=[np.vdot(a,gR[j]@st[:,j+1]) for j in range(len(s))]
        best=max(best,abs(np.mean(cs)))
    return float(best)

def read_pairs():
    out=[]
    with (ROOT/"FROZEN_EXACT_FIBER_PAIRS.csv").open() as f:
        for r in csv.DictReader(f):
            z=dict(r);z["N"]=int(z["N"]);z["pair_id"]=int(z["pair_id"])
            for i in range(z["N"]):z[f"s{i}"]=float(z[f"s{i}"])
            for k in ["p2","p3","p4"]+PRIMS:z[k]=float(z[k])
            out.append(z)
    return out
def read_trips():
    out=[]
    with (ROOT/"FROZEN_RECOVERY_TRIPLETS.csv").open() as f:
        for r in csv.DictReader(f):
            z=dict(r);z["N"]=int(z["N"]);z["triplet_id"]=int(z["triplet_id"])
            for i in range(8):z[f"s{i}"]=float(z[f"s{i}"])
            for k in ["p2","p3","p4"]+PRIMS:z[k]=float(z[k])
            out.append(z)
    return out

pairs=read_pairs();trips=read_trips();results=[]
# N=8 pair and recovery outcomes, both unseen seeds.
for seed in [90,91]:
    print("Building N8 context seed",seed,flush=True);ctx=dense_context(8,seed);idp=dense_obs(ctx,np.ones(8))
    for r in [x for x in pairs if x["N"]==8]:
        s=np.array([r[f"s{i}"] for i in range(8)]);rr=dense_obs(ctx,s)/idp
        z=dict(r);z.update({"seed":seed,"R_dense":rr,"dataset":"pair"});results.append(z)
    for r in trips:
        s=np.array([r[f"s{i}"] for i in range(8)]);rr=dense_obs(ctx,s)/idp
        z=dict(r);z.update({"seed":seed,"R_dense":rr,"dataset":"recovery"});results.append(z)
    print("Finished N8 seed",seed,flush=True)

# N=10 pair outcomes, unseen seed 92.
print("Building N10 context seed 92",flush=True);ctx10=sparse_context(10,92);id10=sparse_obs(ctx10,np.ones(10))
for idx,r in enumerate([x for x in pairs if x["N"]==10]):
    s=np.array([r[f"s{i}"] for i in range(10)]);rr=sparse_obs(ctx10,s)/id10
    z=dict(r);z.update({"seed":92,"R_dense":rr,"dataset":"pair"});results.append(z)
    print("N10",idx+1,"of",16,flush=True)

# Score exact-fiber holes and primitive sign direction.
pair_out=[r for r in results if r["dataset"]=="pair"]
score={"hole":{},"primitives":{}}
def pair_deltas(N,seed):
    rr=[r for r in pair_out if r["N"]==N and r["seed"]==seed]
    ids=sorted(set(r["pair_id"] for r in rr));out=[]
    for pid in ids:
        a=next(r for r in rr if r["pair_id"]==pid and r["member"]=="A")
        b=next(r for r in rr if r["pair_id"]==pid and r["member"]=="B")
        row={"pair_id":pid,"dR":b["R_dense"]-a["R_dense"],"abs_dR":abs(b["R_dense"]-a["R_dense"])}
        for p in PRIMS:row["d_"+p]=b[p]-a[p]
        out.append(row)
    return out

all_deltas={}
for N,seed in [(8,90),(8,91),(10,92)]:
    ds=pair_deltas(N,seed);all_deltas[f"N{N}_seed{seed}"]=ds
    absd=np.array([x["abs_dR"] for x in ds])
    threshold_count=8 if N==8 else 5
    score["hole"][f"N{N}_seed{seed}"]={
        "count_abs_ge_0.02":int(np.sum(absd>=.02)),
        "median_abs_delta":float(np.median(absd)),
        "passes":bool(np.sum(absd>=.02)>=threshold_count and np.median(absd)>=.02)
    }

for p in PRIMS:
    ps={}
    for N,seed in [(8,90),(8,91),(10,92)]:
        ds=all_deltas[f"N{N}_seed{seed}"]
        correct=int(np.sum([np.sign(x["dR"])==np.sign(x["d_"+p]) and x["d_"+p]!=0 for x in ds]))
        need=10 if N==8 else 6
        ps[f"N{N}_seed{seed}"]={"correct":correct,"total":len(ds),"passes":bool(correct>=need)}
    score["primitives"][p]=ps

# Deterministic within-pair member-label shuffle p-values for primitives that pass both N8 seeds.
rng=np.random.default_rng(20260815)
shuffle={}
for p in PRIMS:
    if not(score["primitives"][p]["N8_seed90"]["passes"] and score["primitives"][p]["N8_seed91"]["passes"]):
        continue
    shuffle[p]={}
    for N,seed in [(8,90),(8,91),(10,92)]:
        ds=all_deltas[f"N{N}_seed{seed}"]
        observed=score["primitives"][p][f"N{N}_seed{seed}"]["correct"]
        counts=[]
        for _ in range(1000):
            flips=rng.choice([-1,1],size=len(ds))
            c=sum(np.sign(x["dR"])==np.sign(flips[i]*x["d_"+p]) for i,x in enumerate(ds))
            counts.append(c)
        pv=(1+sum(c>=observed for c in counts))/(1001)
        shuffle[p][f"N{N}_seed{seed}"]={"observed_correct":observed,"one_sided_p":float(pv),"passes":bool(pv<.05)}

# Recovery triplets: all candidate primitives were frozen LOW<MID<HIGH.
recovery={}
rec_out=[r for r in results if r["dataset"]=="recovery"]
for seed in [90,91]:
    details=[];low_to_mid_success=0;high_to_mid_success=0;both=0
    for tid in range(6):
        rr=[r for r in rec_out if r["seed"]==seed and r["triplet_id"]==tid]
        lo=next(r for r in rr if r["member"]=="LOW")["R_dense"]
        mi=next(r for r in rr if r["member"]=="MID")["R_dense"]
        hi=next(r for r in rr if r["member"]=="HIGH")["R_dense"]
        full=abs(hi-lo);near_high=abs(hi-mi);near_low=abs(mi-lo)
        a=near_high<full;b=near_low<full
        low_to_mid_success+=int(a);high_to_mid_success+=int(b);both+=int(a and b)
        details.append({"triplet_id":tid,"R_LOW":lo,"R_MID":mi,"R_HIGH":hi,
                        "full_gap":full,"high_vs_mid_gap":near_high,"mid_vs_low_gap":near_low,
                        "LOW_to_MID_toward_HIGH_shrinks":bool(a),
                        "HIGH_to_MID_toward_LOW_shrinks":bool(b)})
    recovery[f"seed{seed}"]={"details":details,
        "LOW_to_MID_success_count":low_to_mid_success,
        "HIGH_to_MID_success_count":high_to_mid_success,
        "both_directions_success_count":both,
        "reviewed_5_of_6_threshold_pass_LOW_to_MID":bool(low_to_mid_success>=5),
        "reviewed_5_of_6_threshold_pass_HIGH_to_MID":bool(high_to_mid_success>=5)}

# Primitive overall based on exact reviewed direction + shuffle.
for p in PRIMS:
    n8=score["primitives"][p]["N8_seed90"]["passes"] and score["primitives"][p]["N8_seed91"]["passes"]
    n10=score["primitives"][p]["N10_seed92"]["passes"]
    art=False
    if p in shuffle:
        art=all(v["passes"] for v in shuffle[p].values())
    score["primitives"][p]["N8_pass_both"]=bool(n8)
    score["primitives"][p]["N10_transfer_pass"]=bool(n10)
    score["primitives"][p]["artifact_all_reported_pass"]=bool(art)

hole_all=score["hole"]["N8_seed90"]["passes"] and score["hole"]["N8_seed91"]["passes"] and score["hole"]["N10_seed92"]["passes"]
survivors=[p for p in PRIMS if score["primitives"][p]["N8_pass_both"] and score["primitives"][p]["N10_transfer_pass"] and score["primitives"][p]["artifact_all_reported_pass"]]
rec_primary=recovery["seed90"]["reviewed_5_of_6_threshold_pass_LOW_to_MID"]
summary={"local_manifest_sha256":M["local_manifest_sha256"],
         "hole_scores":score["hole"],"primitive_scores":score["primitives"],
         "shuffle_controls":shuffle,"recovery":recovery,
         "hole_all_sizes_supported":bool(hole_all),
         "primitive_survivors_before_recovery":survivors,
         "primary_recovery_seed90_low_to_mid_pass":bool(rec_primary),
         "overall_refinement_support":bool(hole_all and len(survivors)>0 and rec_primary)}
# Write rows with union fields.
keys=[]
for r in results:
    for k in r:
        if k not in keys:keys.append(k)
with (ROOT/"exact_fiber_transport_results.csv").open("w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=keys);w.writeheader();w.writerows(results)
(ROOT/"exact_fiber_pair_deltas.json").write_text(json.dumps(all_deltas,indent=2))
(ROOT/"exact_fiber_summary.json").write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2),flush=True)
