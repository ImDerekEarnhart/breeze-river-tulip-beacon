from __future__ import annotations
from typing import Any
import numpy as np
from .types import Action,FrameObservation
class ArcAgiAdapter:
    """Thin lazy adapter around official arc-agi/arcengine interfaces."""
    def __init__(self,game_id:str,*,render_mode=None,**arcade_kwargs:Any):
        try:
            import arc_agi
            from arcengine import GameAction
        except ImportError as e:raise RuntimeError("Official arc-agi toolkit is not installed. Install with `pip install arc-agi`.") from e
        self._GameAction=GameAction;self.game_id=game_id;self.arcade=arc_agi.Arcade(**arcade_kwargs);self.env=self.arcade.make(game_id,render_mode=render_mode);self.level=0
        if self.env is None:raise RuntimeError(f"Failed to create ARC environment {game_id}")
    def _obs(self,raw):
        if raw is None:raise RuntimeError("ARC environment returned no frame data")
        fd=raw.frame if hasattr(raw,"frame") else raw.get("frame") if isinstance(raw,dict) else raw;arr=np.asarray(fd,dtype=np.uint8)
        if arr.ndim==3:frame=arr[-1];trans=[x.copy() for x in arr[:-1]]
        elif arr.ndim==2:frame=arr;trans=[]
        else:raise ValueError(f"Expected T×64×64 or 64×64, got {arr.shape}")
        rs=getattr(raw,"state",None) if not isinstance(raw,dict) else raw.get("state",raw.get("game_state"));state=getattr(rs,"name",str(rs or "PLAYING"))
        levels=getattr(raw,"levels_completed",self.level) if not isinstance(raw,dict) else raw.get("levels_completed",self.level);self.level=int(levels)
        av=getattr(raw,"available_actions",None) if not isinstance(raw,dict) else raw.get("available_actions")
        if av:actions=tuple(a.name if hasattr(a,"name") else f"ACTION{int(a)}" if isinstance(a,(int,np.integer)) else str(a) for a in av)
        else:actions=tuple(getattr(a,"name",str(a)) for a in self.env.action_space)
        return FrameObservation(frame,actions,self.game_id,self.level,state,trans)
    def reset(self):return self._obs(self.env.reset())
    def step(self,a:Action):
        ga=getattr(self._GameAction,a.name);data={}
        if a.name=="ACTION6":data={"x":int(a.x),"y":int(a.y)}
        raw=self.env.step(ga,data=data) if data else self.env.step(ga);return self._obs(raw)
