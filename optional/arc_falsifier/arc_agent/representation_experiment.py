from __future__ import annotations
from pathlib import Path
import json
from .types import Action
from .toy_env import ToggleMoveEnv
from .representation import HistoryFeatureRepair,HistoryTransitionSample

def scripted_trace(initial_x,cycles,prefix):
    env=ToggleMoveEnv(initial_x=initial_x,target_x=min(58,initial_x+12));obs=env.reset();counts={"ACTION1":0,"ACTION2":0};rows=[];turn=0
    for name in [x for _ in range(cycles) for x in ("ACTION1","ACTION2","ACTION1","ACTION1","ACTION2","ACTION1")]:
        if obs.game_state=="WIN":break
        a=Action(name);before=dict(counts);post=env.step(a);rows.append(HistoryTransitionSample(f"{prefix}_{turn}",obs.frame.copy(),a,post.frame.copy(),before));counts[name]+=1;obs=post;turn+=1
    return rows

def run_experiment(out):
    out=Path(out);out.mkdir(parents=True,exist_ok=True);train=[];held=[]
    for i,x in enumerate((4,7,10)):train+=scripted_trace(x,2,f"tr{i}")
    for i,x in enumerate((13,16,19,22)):held+=scripted_trace(x,2,f"ho{i}")
    r=HistoryFeatureRepair((2,3));c=r.fit(train);c=r.evaluate_heldout(held,min_samples=8,min_gain=.2,min_accuracy=.8)
    d={"status":c.status,"feature":f"count({c.feature_action}) mod {c.modulus}","candidate_hash":c.candidate_hash,"training_samples":c.training_samples,"heldout_scored_samples":c.heldout_samples,"repair_accuracy":c.heldout_accuracy,"detection_only_baseline_accuracy":c.baseline_accuracy,"absolute_gain":c.heldout_accuracy-c.baseline_accuracy,"contradictions":c.contradictions}
    (out/"representation_repair_result.json").write_text(json.dumps(d,indent=2));return c,d
if __name__=="__main__":
    _,d=run_experiment("results/representation_repair");print(json.dumps(d,indent=2))
