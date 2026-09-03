import numpy as np
from arc_agent.types import Action,FrameObservation,Prediction
from arc_agent.executor import CheckedExecutor
from arc_agent.ledger import ImmutableEmpiricalLedger

class E:
 def step(self,a): return FrameObservation(np.zeros((64,64),dtype=np.uint8),("ACTION1",),"g",0)
class M:
 def predict(self,f,a):
  from arc_agent.world_model import ModelPrediction
  return ModelPrediction(None,Prediction(None,"UNKNOWN",0.0))

def test_unknown_is_not_match(tmp_path):
 pre=FrameObservation(np.zeros((64,64),dtype=np.uint8),("ACTION1",),"g",0);r=CheckedExecutor(E(),ImmutableEmpiricalLedger(tmp_path/"l.jsonl"),M()).execute(pre,Action("ACTION1"));assert not r.prediction_known and not r.prediction_matched
