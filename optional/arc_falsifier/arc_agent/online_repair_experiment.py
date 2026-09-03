from __future__ import annotations
from pathlib import Path
import json
from .agent import ArcScientificAgent
from .toy_env import MultiPhaseToggleEnv
from .representation_experiment import run_experiment

def run(out="results/online_repair"):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    candidate,_=run_experiment(out/"pretrain")
    rows=[]
    for x in (4,6,8):
        base=ArcScientificAgent(MultiPhaseToggleEnv(initial_x=x),out/f"base_{x}",history_candidate=None).run(40)
        repaired=ArcScientificAgent(MultiPhaseToggleEnv(initial_x=x),out/f"repair_{x}",history_candidate=candidate).run(40)
        rows.append({"initial_x":x,"baseline":{"wins":base.wins,"actions":base.real_actions,"accuracy":base.transition_prediction_accuracy,"coverage":base.prediction_coverage,"mismatches":base.prediction_mismatches,"unknown":base.unknown_predictions},"repaired":{"wins":repaired.wins,"actions":repaired.real_actions,"accuracy":repaired.transition_prediction_accuracy,"coverage":repaired.prediction_coverage,"mismatches":repaired.prediction_mismatches,"unknown":repaired.unknown_predictions,"candidate_invalidations":repaired.history_candidate_invalidations}})
    d={"candidate_hash":candidate.candidate_hash,"candidate_status":candidate.status,"episodes":rows,"mean_action_delta":sum(r["repaired"]["actions"]-r["baseline"]["actions"] for r in rows)/len(rows),"mean_accuracy_gain":sum(r["repaired"]["accuracy"]-r["baseline"]["accuracy"] for r in rows)/len(rows)}
    (out/"online_repair_result.json").write_text(json.dumps(d,indent=2));return d
if __name__=="__main__":print(json.dumps(run(),indent=2))
