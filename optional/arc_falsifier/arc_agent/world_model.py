from __future__ import annotations
from dataclasses import dataclass
import hashlib, numpy as np
from .types import Action,Prediction
@dataclass(slots=True)
class ModelPrediction: frame:np.ndarray|None;prediction:Prediction
class ExecutableWorldModel:
    def __init__(self,hypotheses):self.hypotheses=hypotheses;self.history_candidate=None;self.action_counts={}
    def set_history_candidate(self,candidate):
        self.history_candidate=candidate if candidate is not None and candidate.status=="admitted" else None
    def set_action_counts(self,counts): self.action_counts=dict(counts)
    def predict(self,frame,action):
        if self.history_candidate is not None:
            arr=self.history_candidate.predict(frame,action,self.action_counts)
            if arr is not None:
                sig=hashlib.sha256(np.asarray(arr,dtype=np.uint8).tobytes()).hexdigest(); st=f"contextual predictor using count({self.history_candidate.feature_action}) mod {self.history_candidate.modulus}"
                return ModelPrediction(arr,Prediction(sig,st,.9,self.history_candidate.candidate_hash))
        hs=sorted(self.hypotheses.hypotheses(action),key=lambda h:h.confidence,reverse=True)
        if not hs:return ModelPrediction(None,Prediction(None,"UNKNOWN",0.0))
        h=hs[0];return ModelPrediction(h.predictor(frame,action),h.predict(frame,action))
