from __future__ import annotations
from dataclasses import dataclass
from .types import Action,FrameObservation
@dataclass(slots=True)
class ExecutionResult:
    observation:FrameObservation;prediction_known:bool;prediction_matched:bool;stopped_for_mismatch:bool;record_hash:str;hypothesis_id:str|None=None
class CheckedExecutor:
    def __init__(self,env,ledger,model):self.env=env;self.ledger=ledger;self.model=model;self.turn=0
    def execute(self,pre,action):
        mp=self.model.predict(pre.frame,action);post=self.env.step(action);rec=self.ledger.append(turn=self.turn,pre=pre,action=action,prediction=mp.prediction,post=post);self.turn+=1
        known=mp.prediction.expected_signature is not None;matched=known and mp.prediction.expected_signature==post.signature()
        return ExecutionResult(post,known,matched,known and not matched,rec["record_hash"],mp.prediction.hypothesis_id)
