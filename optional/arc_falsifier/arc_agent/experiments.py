from __future__ import annotations
from dataclasses import dataclass
import numpy as np
from .types import Action
@dataclass(slots=True)
class ExperimentScore: action:Action;score:float;distinct_predictions:int;mean_confidence:float;cost:float
class ExperimentSelector:
    def __init__(self,store):self.store=store
    def score(self,frame,action,cost=1.0):
        hs=self.store.hypotheses(action); preds=[h.predict(frame,action).expected_signature or "UNKNOWN" for h in hs]; conf=[h.confidence for h in hs]; d=len(set(preds)); disc=max(0,d-1); mean=float(np.mean(conf)) if conf else 0.0
        return ExperimentScore(action,(disc*(1-.5*mean))/max(cost,1e-9),d,mean,cost)
    def choose(self,frame,actions):
        ss=[self.score(frame,a,1.2 if a.name=="ACTION6" else 1.0) for a in actions]; return max(ss,key=lambda s:(s.score,s.distinct_predictions,-s.cost,s.action.key())) if ss else None
