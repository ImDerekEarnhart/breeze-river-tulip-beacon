from __future__ import annotations
from dataclasses import dataclass,field
from collections import Counter,defaultdict
from typing import Iterable
import hashlib
import numpy as np
from .types import Action
from .hypotheses import DynamicsHypothesis,infer_effect_hypothesis

@dataclass(slots=True)
class HistoryTransitionSample:
    transition_id:str; pre:np.ndarray; action:Action; post:np.ndarray; action_counts_before:dict[str,int]

@dataclass(slots=True)
class RepresentationHole:
    signature:str; action_key:tuple; transition_ids:list[str]; successor_signatures:list[str]

class RepresentationHoleDetector:
    def __init__(self): self.rows=defaultdict(list); self.holes=[]
    def observe(self,s:HistoryTransitionSample):
        pre_sig=hashlib.sha256(np.asarray(s.pre,dtype=np.uint8).tobytes()).hexdigest(); post_sig=hashlib.sha256(np.asarray(s.post,dtype=np.uint8).tobytes()).hexdigest(); k=(pre_sig,s.action.key())
        self.rows[k].append((s.transition_id,post_sig))
        succ=sorted({p for _,p in self.rows[k]})
        if len(succ)>1 and not any(h.signature==pre_sig and h.action_key==s.action.key() for h in self.holes):
            self.holes.append(RepresentationHole(pre_sig,s.action.key(),[i for i,_ in self.rows[k]],succ))
            return self.holes[-1]
        return None

@dataclass(slots=True)
class HistoryFeatureCandidate:
    feature_action:str; modulus:int; predictors:dict[tuple[str,int],DynamicsHypothesis]; training_samples:int; discriminated_actions:tuple[str,...]; candidate_hash:str
    status:str="frozen"; heldout_samples:int=0; heldout_matches:int=0; heldout_baseline_matches:int=0; contradictions:list[str]=field(default_factory=list)
    @property
    def heldout_accuracy(self):return self.heldout_matches/self.heldout_samples if self.heldout_samples else 0.0
    @property
    def baseline_accuracy(self):return self.heldout_baseline_matches/self.heldout_samples if self.heldout_samples else 0.0
    def feature_value(self,counts):return int(counts.get(self.feature_action,0))%self.modulus
    def predict(self,pre,action,counts):
        h=self.predictors.get((action.name,self.feature_value(counts))); return None if h is None else h.predictor(np.asarray(pre,dtype=np.uint8),action)

class HistoryFeatureRepair:
    def __init__(self,moduli=(2,3)): self.moduli=moduli; self.candidate=None; self.baseline_predictors={}
    def _effect(self,s):return infer_effect_hypothesis(s.pre,s.action,s.post,s.transition_id)
    def fit(self,samples:Iterable[HistoryTransitionSample]):
        rows=list(samples)
        if len(rows)<4:return None
        by=defaultdict(list)
        for s in rows:by[s.action.name].append(self._effect(s))
        self.baseline_predictors={}
        for a,eff in by.items():
            st=Counter(e.statement for e in eff).most_common(1)[0][0]; self.baseline_predictors[a]=next(e for e in eff if e.statement==st)
        names=sorted({k for s in rows for k in s.action_counts_before}|{s.action.name for s in rows}); scored=[]
        for feat in names:
            for m in self.moduli:
                buckets=defaultdict(list)
                for s in rows:buckets[(s.action.name,int(s.action_counts_before.get(feat,0))%m)].append(self._effect(s))
                preds={}; bad=[]
                for k,eff in buckets.items():
                    u={e.statement for e in eff}
                    if len(u)==1:preds[k]=eff[0]
                    else:bad.append(k)
                if bad:continue
                discr=[a for a in sorted({s.action.name for s in rows}) if len({h.statement for (aa,_),h in preds.items() if aa==a})>=2]
                if not discr:continue
                payload=f"{feat}|{m}|"+"|".join(f"{k[0]}:{k[1]}:{v.statement}" for k,v in sorted(preds.items()))
                c=HistoryFeatureCandidate(feat,m,preds,len(rows),tuple(discr),hashlib.sha256(payload.encode()).hexdigest())
                scored.append(((-len(discr),m,-len(preds),feat),c))
        if not scored:return None
        scored.sort(key=lambda z:z[0]); self.candidate=scored[0][1]; return self.candidate
    def evaluate_heldout(self,samples,*,min_samples=4,min_gain=.2,min_accuracy=.8):
        c=self.candidate
        if c is None:raise RuntimeError("fit first")
        for s in samples:
            pred=c.predict(s.pre,s.action,s.action_counts_before); base=self.baseline_predictors.get(s.action.name); actual=np.asarray(s.post,dtype=np.uint8)
            if pred is None:continue
            c.heldout_samples+=1
            if np.array_equal(np.asarray(pred,dtype=np.uint8),actual):c.heldout_matches+=1
            else:c.contradictions.append(s.transition_id)
            if base is not None and np.array_equal(np.asarray(base.predictor(s.pre,s.action),dtype=np.uint8),actual):c.heldout_baseline_matches+=1
        gain=c.heldout_accuracy-c.baseline_accuracy
        c.status="admitted" if c.heldout_samples>=min_samples and c.heldout_accuracy>=min_accuracy and gain>=min_gain and not c.contradictions else "rejected"
        return c
