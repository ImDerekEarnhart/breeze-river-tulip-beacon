from arc_agent.representation import HistoryFeatureRepair,RepresentationHoleDetector,HistoryTransitionSample
from arc_agent.representation_experiment import scripted_trace
from arc_agent.types import Action
from arc_agent.toy_env import ToggleMoveEnv

def test_representation_repair_admitted():
 train=sum((scripted_trace(x,2,f"tr{x}") for x in (4,7,10)),[]);held=sum((scripted_trace(x,2,f"ho{x}") for x in (13,16,19)),[]);r=HistoryFeatureRepair((2,3));c=r.fit(train);assert c and c.feature_action=="ACTION2" and c.modulus==2;c=r.evaluate_heldout(held,min_samples=8,min_gain=.2,min_accuracy=.8);assert c.status=="admitted" and c.heldout_accuracy==1.0

def test_representation_hole_detected():
 env=ToggleMoveEnv(initial_x=4,target_x=20);o=env.reset();d=RepresentationHoleDetector();counts={"ACTION1":0,"ACTION2":0};p=env.step(Action("ACTION1"));assert d.observe(HistoryTransitionSample("a",o.frame,Action("ACTION1"),p.frame,dict(counts))) is None;env.step(Action("ACTION2"));q=env.step(Action("ACTION2"));r=env.step(Action("ACTION2"));counts["ACTION2"]=3;s=env.step(Action("ACTION1"));# same visible x=4, different outcome
 assert d.observe(HistoryTransitionSample("b",q.frame,Action("ACTION1"),s.frame,dict(counts))) is not None
