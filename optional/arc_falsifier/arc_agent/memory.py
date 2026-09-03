from __future__ import annotations
from dataclasses import dataclass,asdict,field
from pathlib import Path
import json
@dataclass(slots=True)
class LevelTheory:
    game_id:str;level:int;confirmed_mechanics:list[str]=field(default_factory=list);falsified_hypotheses:list[str]=field(default_factory=list);representation_holes:int=0;goal_notes:list[str]=field(default_factory=list)
    def save(self,path):Path(path).write_text(json.dumps(asdict(self),indent=2),encoding="utf-8")
