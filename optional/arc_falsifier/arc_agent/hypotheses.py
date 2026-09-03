from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
import hashlib
import numpy as np
from .types import Action, Prediction
from .perception import extract_objects

class HypothesisStatus(str,Enum):
    PROVISIONAL="provisional"; SUPPORTED="supported"; REFUTED="refuted"; SUPERSEDED="superseded"

@dataclass(slots=True)
class DynamicsHypothesis:
    hypothesis_id:str; statement:str; action_name:str; predictor:callable; confidence:float=.1
    status:HypothesisStatus=HypothesisStatus.PROVISIONAL
    supporting_transition_ids:list[str]=field(default_factory=list); contradicting_transition_ids:list[str]=field(default_factory=list)
    def predict(self, frame:np.ndarray, action:Action)->Prediction:
        arr=self.predictor(frame,action)
        if arr is None: return Prediction(None,self.statement,self.confidence,self.hypothesis_id)
        sig=hashlib.sha256(np.asarray(arr,dtype=np.uint8).tobytes()).hexdigest()
        return Prediction(sig,self.statement,self.confidence,self.hypothesis_id)
    def observe(self, pre, action, post, tid:str):
        arr=self.predictor(pre,action)
        ok=arr is not None and np.array_equal(np.asarray(arr,dtype=np.uint8),np.asarray(post,dtype=np.uint8))
        if ok:
            if tid not in self.supporting_transition_ids: self.supporting_transition_ids.append(tid)
            self.confidence=min(.99,self.confidence+.1)
            if len(self.supporting_transition_ids)>=2 and not self.contradicting_transition_ids: self.status=HypothesisStatus.SUPPORTED
        else:
            if tid not in self.contradicting_transition_ids: self.contradicting_transition_ids.append(tid)
            self.confidence*=.35
            if self.contradicting_transition_ids: self.status=HypothesisStatus.REFUTED
        return ok

def infer_effect_hypothesis(pre:np.ndarray,action:Action,post:np.ndarray,transition_id:str)->DynamicsHypothesis:
    pre=np.asarray(pre,dtype=np.uint8); post=np.asarray(post,dtype=np.uint8)
    def norm(o):
        y0,x0,_,_=o.bbox; return frozenset((y-y0,x-x0) for y,x in o.cells)
    if np.array_equal(pre,post):
        return DynamicsHypothesis(f"H_{action.name}_NO_CHANGE_OBS",f"{action.name} leaves the visible decision frame unchanged in this context",action.name,lambda f,a:np.asarray(f,dtype=np.uint8).copy(),.55,supporting_transition_ids=[transition_id])
    moved=[]
    for a in extract_objects(pre):
        for b in extract_objects(post):
            if b.color==a.color and b.area==a.area and norm(b)==norm(a):
                dy,dx=b.bbox[0]-a.bbox[0],b.bbox[1]-a.bbox[1]
                if (dy,dx)!=(0,0): moved.append((a,dy,dx,norm(a)))
    if len(moved)==1:
        o,dy,dx,shape=moved[0]; color=o.color; sig=hashlib.sha1(repr((action.name,color,shape,dy,dx)).encode()).hexdigest()[:10]
        def translate(frame,act,color=color,shape=shape,dy=dy,dx=dx):
            out=np.asarray(frame,dtype=np.uint8).copy(); cand=[z for z in extract_objects(out) if z.color==color and norm(z)==shape]
            if len(cand)!=1:return None
            z=cand[0]; new={(y+dy,x+dx) for y,x in z.cells}
            if any(y<0 or x<0 or y>=64 or x>=64 for y,x in new):return None
            if any(int(out[y,x]) not in (0,color) and (y,x) not in z.cells for y,x in new):return None
            for y,x in z.cells: out[y,x]=0
            for y,x in new: out[y,x]=color
            return out
        return DynamicsHypothesis(f"H_{action.name}_MOVE_{sig}",f"{action.name} translates one color-{color} object by (dy={dy}, dx={dx})",action.name,translate,.55,supporting_transition_ids=[transition_id])
    edits=[(int(y),int(x),int(post[y,x])) for y,x in np.argwhere(pre!=post)]
    sig=hashlib.sha1(repr((action.name,edits)).encode()).hexdigest()[:10]
    def edit(frame,act,edits=tuple(edits)):
        out=np.asarray(frame,dtype=np.uint8).copy()
        for y,x,v in edits: out[y,x]=v
        return out
    return DynamicsHypothesis(f"H_{action.name}_EDIT_{sig}",f"{action.name} applies a learned visible edit template ({len(edits)} cells)",action.name,edit,.35,supporting_transition_ids=[transition_id])

class HypothesisStore:
    def __init__(self):
        self.by_action=defaultdict(list)
        for n in [f"ACTION{i}" for i in range(1,8)]: self.by_action[n].append(DynamicsHypothesis(f"H_{n}_NO_CHANGE",f"{n} leaves visible frame unchanged",n,lambda f,a:np.asarray(f,dtype=np.uint8).copy(),.15))
    def hypotheses(self,action:Action): return [h for h in self.by_action[action.name] if h.status not in {HypothesisStatus.REFUTED,HypothesisStatus.SUPERSEDED}]
    def all(self,action_name:str): return list(self.by_action[action_name])
    def observe_existing(self,pre,action,post,tid):
        return [(h.hypothesis_id,h.observe(pre,action,post,tid)) for h in list(self.hypotheses(action))]
    def learn_exact_transition(self,pre,action,post,tid):
        h=infer_effect_hypothesis(pre,action,post,tid)
        for e in self.by_action[action.name]:
            if e.statement==h.statement and e.status!=HypothesisStatus.REFUTED:
                if tid not in e.supporting_transition_ids:e.supporting_transition_ids.append(tid)
                e.confidence=min(.99,e.confidence+.1); return e
        self.by_action[action.name].append(h); return h
