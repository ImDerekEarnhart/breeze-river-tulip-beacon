import numpy as np
from pathlib import Path
from arc_agent.types import Action,FrameObservation
from arc_agent.ledger import ImmutableEmpiricalLedger
from arc_agent.perception import extract_objects
from arc_agent.hypotheses import infer_effect_hypothesis
from arc_agent.toy_env import ToggleMoveEnv

def obs(x):
 f=np.zeros((64,64),dtype=np.uint8);f[1,x]=2;return f

def test_frame_signature():assert FrameObservation(obs(1),("ACTION1",),"g",0).signature()!=FrameObservation(obs(2),("ACTION1",),"g",0).signature()
def test_perception():
 f=obs(1);f[5:7,5:7]=3;o=extract_objects(f);assert sorted(z.area for z in o)==[1,4]
def test_translation_hypothesis():
 h=infer_effect_hypothesis(obs(1),Action("ACTION1"),obs(3),"t");assert np.array_equal(h.predictor(obs(5),Action("ACTION1")),obs(7))
def test_ledger_hash_chain(tmp_path):
 l=ImmutableEmpiricalLedger(tmp_path/"x.jsonl");e=ToggleMoveEnv();a=e.reset();b=e.step(Action("ACTION2"));from arc_agent.types import Prediction;l.append(turn=0,pre=a,action=Action("ACTION2"),prediction=Prediction(None,"x"),post=b);assert l.verify()
