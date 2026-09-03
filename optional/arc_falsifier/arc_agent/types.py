from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
import hashlib, json
import numpy as np

@dataclass(frozen=True, slots=True)
class Action:
    name: str
    x: int | None = None
    y: int | None = None
    def key(self) -> tuple:
        return (self.name, self.x, self.y)
    def to_json(self) -> dict[str, Any]:
        d={"name":self.name}
        if self.x is not None: d["x"]=int(self.x)
        if self.y is not None: d["y"]=int(self.y)
        return d

@dataclass(slots=True)
class Prediction:
    expected_signature: str | None
    statement: str
    confidence: float = 0.0
    hypothesis_id: str | None = None

@dataclass(slots=True)
class FrameObservation:
    frame: np.ndarray
    available_actions: tuple[str, ...]
    game_id: str
    level: int
    game_state: str = "PLAYING"
    transient_frames: list[np.ndarray] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    def __post_init__(self):
        self.frame=np.asarray(self.frame,dtype=np.uint8)
        if self.frame.shape != (64,64):
            raise ValueError(f"decision frame must be 64x64, got {self.frame.shape}")
    def signature(self) -> str:
        return hashlib.sha256(self.frame.tobytes()).hexdigest()
