from __future__ import annotations
import argparse,json
from dataclasses import asdict
from pathlib import Path
import yaml
from .agent import ArcScientificAgent
from .toy_env import ToggleMoveEnv
from .adapter import ArcAgiAdapter
def main():
    ap=argparse.ArgumentParser();ap.add_argument("--config",default="configs/v1.yaml");ap.add_argument("--game",default="toy_hidden_mode");ap.add_argument("--out",default="results/latest");a=ap.parse_args();cfg=yaml.safe_load(Path(a.config).read_text());env=ToggleMoveEnv() if a.game=="toy_hidden_mode" else ArcAgiAdapter(a.game);m=ArcScientificAgent(env,a.out).run(cfg.get("max_real_actions",80));d=asdict(m);d["transition_prediction_accuracy"]=m.transition_prediction_accuracy;print(json.dumps(d,indent=2))
if __name__=="__main__":main()
