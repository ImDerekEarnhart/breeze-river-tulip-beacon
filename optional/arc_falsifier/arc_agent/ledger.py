from __future__ import annotations
from pathlib import Path
from typing import Any
import hashlib, json, time
import numpy as np
from .types import Action, FrameObservation, Prediction

class ImmutableEmpiricalLedger:
    """Append-only JSONL ledger with a hash chain over every real interaction."""
    def __init__(self, path: str | Path):
        self.path=Path(path); self.path.parent.mkdir(parents=True,exist_ok=True)
        self.prev_hash="GENESIS"
        if self.path.exists():
            for line in self.path.read_text(encoding="utf-8").splitlines():
                if line.strip(): self.prev_hash=json.loads(line)["record_hash"]
    @staticmethod
    def _frame(a: np.ndarray) -> list[list[int]]:
        return np.asarray(a,dtype=np.uint8).tolist()
    def append(self, *, turn:int, pre:FrameObservation, action:Action, prediction:Prediction, post:FrameObservation) -> dict[str,Any]:
        base={
            "schema":"arc-empirical-transition/1",
            "sequence":turn,"timestamp_ns":time.time_ns(),"game_id":pre.game_id,"level":pre.level,
            "pre_frame":self._frame(pre.frame),"available_actions":list(pre.available_actions),
            "action":action.to_json(),
            "prediction":{"expected_signature":prediction.expected_signature,"statement":prediction.statement,"confidence":prediction.confidence,"hypothesis_id":prediction.hypothesis_id},
            "transient_frames":[self._frame(x) for x in post.transient_frames],
            "post_frame":self._frame(post.frame),"game_state":post.game_state,"levels_completed":post.level,
            "pre_signature":pre.signature(),"post_signature":post.signature(),"prev_hash":self.prev_hash,
        }
        payload=json.dumps(base,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()
        rh=hashlib.sha256(payload).hexdigest(); base["record_hash"]=rh
        with self.path.open("a",encoding="utf-8") as f: f.write(json.dumps(base,separators=(",",":"))+"\n")
        self.prev_hash=rh
        return base
    def verify(self) -> bool:
        prev="GENESIS"
        if not self.path.exists(): return True
        for raw in self.path.read_text(encoding="utf-8").splitlines():
            if not raw.strip(): continue
            r=json.loads(raw); got=r.pop("record_hash")
            if r.get("prev_hash")!=prev: return False
            want=hashlib.sha256(json.dumps(r,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()
            if got!=want: return False
            prev=got
        return True
