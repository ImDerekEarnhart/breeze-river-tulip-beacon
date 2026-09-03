from __future__ import annotations
from dataclasses import dataclass,asdict
from pathlib import Path
from collections import Counter
import json, numpy as np
from .types import Action
from .ledger import ImmutableEmpiricalLedger
from .hypotheses import HypothesisStore
from .world_model import ExecutableWorldModel
from .executor import CheckedExecutor
from .representation import RepresentationHoleDetector,HistoryTransitionSample
from .goals import GoalStore

@dataclass(slots=True)
class AgentMetrics:
    real_actions:int=0;wins:int=0;prediction_matches:int=0;prediction_mismatches:int=0;unknown_predictions:int=0;representation_holes:int=0;preregistered_predictions:int=0;unnecessary_repeated_probes:int=0;counterexamples:int=0;history_candidate_invalidations:int=0
    @property
    def transition_prediction_accuracy(self):
        known=self.prediction_matches+self.prediction_mismatches
        return self.prediction_matches/known if known else 0.0
    @property
    def prediction_coverage(self):return (self.prediction_matches+self.prediction_mismatches)/self.real_actions if self.real_actions else 0.0

class ArcScientificAgent:
    def __init__(self,env,out_dir,*,enable_evidence=True,enable_falsification=True,enable_rep_holes=True,history_candidate=None):
        self.env=env;self.out=Path(out_dir);self.out.mkdir(parents=True,exist_ok=True);self.store=HypothesisStore();self.model=ExecutableWorldModel(self.store);self.model.set_history_candidate(history_candidate);self.ledger=ImmutableEmpiricalLedger(self.out/"transitions.jsonl");self.exec=CheckedExecutor(env,self.ledger,self.model);self.holes=RepresentationHoleDetector();self.goals=GoalStore();self.enable_evidence=enable_evidence;self.enable_falsification=enable_falsification;self.enable_rep_holes=enable_rep_holes;self.counts=Counter();self.metrics=AgentMetrics();self.samples=[]
    def _choose(self,obs):
        # Cold-start coverage prevents declaring an untried action dead.
        for n in obs.available_actions:
            if self.counts[n]==0:return Action(n)
        # Prefer actions whose current model predicts visible progress/change. Unknown
        # outranks a known no-op because it is potentially informative.
        scored=[]
        self.model.set_action_counts(dict(self.counts))
        for n in obs.available_actions:
            a=Action(n);mp=self.model.predict(obs.frame,a)
            if mp.frame is None:score=1.0
            else:score=2.0 if not np.array_equal(np.asarray(mp.frame,dtype=np.uint8),obs.frame) else 0.0
            # Slightly prefer non-ACTION6 at equal score in this v1.
            scored.append((score, -int(n=="ACTION6"), a))
        best=max(scored,key=lambda z:(z[0],z[1],z[2].key()))
        if best[0]>0:return best[2]
        # All models predict no visible progress: perturb a latent mode with the
        # least-used available action instead of repeating a known no-op forever.
        return min((Action(n) for n in obs.available_actions),key=lambda a:(self.counts[a.name],a.key()))
    def run(self,max_real_actions=80):
        obs=self.env.reset();last_key=None
        while self.metrics.real_actions<max_real_actions and obs.game_state not in {"WIN","GAME_OVER"}:
            action=self._choose(obs);before=dict(self.counts);self.model.set_action_counts(before);pre=obs.frame.copy();res=self.exec.execute(obs,action);post=res.observation;tid=res.record_hash
            self.metrics.real_actions+=1;self.metrics.preregistered_predictions+=1
            if not res.prediction_known:self.metrics.unknown_predictions+=1
            elif res.prediction_matched:self.metrics.prediction_matches+=1
            else:self.metrics.prediction_mismatches+=1;self.metrics.counterexamples+=1
            # A prospectively admitted contextual rule is still defeasible. One
            # concrete contradiction disables it immediately rather than rescuing it.
            if res.prediction_known and not res.prediction_matched and self.model.history_candidate is not None and res.hypothesis_id==self.model.history_candidate.candidate_hash:
                self.model.set_history_candidate(None);self.metrics.history_candidate_invalidations+=1
            s=HistoryTransitionSample(tid,pre,action,post.frame.copy(),before);self.samples.append(s)
            if self.enable_rep_holes and self.holes.observe(s):self.metrics.representation_holes+=1
            if self.enable_falsification:self.store.observe_existing(pre,action,post.frame,tid)
            if self.enable_evidence:self.store.learn_exact_transition(pre,action,post.frame,tid)
            self.goals.observe(post.frame,post.game_state=="WIN",tid)
            key=(obs.signature(),action.key())
            if key==last_key:self.metrics.unnecessary_repeated_probes+=1
            last_key=key;self.counts[action.name]+=1;obs=post
        self.metrics.wins=int(obs.game_state=="WIN")
        d=asdict(self.metrics);d["transition_prediction_accuracy"]=self.metrics.transition_prediction_accuracy;d["prediction_coverage"]=self.metrics.prediction_coverage;(self.out/"metrics.json").write_text(json.dumps(d,indent=2),encoding="utf-8");return self.metrics
