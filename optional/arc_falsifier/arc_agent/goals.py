from __future__ import annotations
from dataclasses import dataclass,field
from enum import Enum
import numpy as np
from .perception import extract_objects
class GoalStatus(str,Enum):PROVISIONAL="provisional";SUPPORTED="supported";REFUTED="refuted"
@dataclass(slots=True)
class GoalHypothesis:
    goal_id:str;statement:str;predicate:callable;confidence:float=.1;status:GoalStatus=GoalStatus.PROVISIONAL;positive_evidence:list[str]=field(default_factory=list);negative_evidence:list[str]=field(default_factory=list)
class GoalStore:
    def __init__(self):
        self.goals=[GoalHypothesis("G_SINGLE","one object",lambda f:len(extract_objects(f))==1),GoalHypothesis("G_TWO","two objects",lambda f:len(extract_objects(f))==2),GoalHypothesis("G_NONE","no objects",lambda f:len(extract_objects(f))==0)]
    def observe(self,frame,won,eid):
        for g in self.goals:
            sat=bool(g.predicate(frame))
            if won and sat:g.positive_evidence.append(eid);g.confidence=min(.99,g.confidence+.35)
            elif sat and not won:g.negative_evidence.append(eid);g.confidence*=.35;g.status=GoalStatus.REFUTED
