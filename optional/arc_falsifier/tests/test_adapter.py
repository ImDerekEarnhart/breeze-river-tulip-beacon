import numpy as np
from types import SimpleNamespace
from arc_agent.adapter import ArcAgiAdapter

def test_adapter_preserves_transients_without_init():
 a=object.__new__(ArcAgiAdapter);a.game_id="g";a.level=0;a.env=SimpleNamespace(action_space=[]);raw=SimpleNamespace(frame=[np.zeros((64,64),dtype=np.uint8),np.ones((64,64),dtype=np.uint8)],state=SimpleNamespace(name="PLAYING"),levels_completed=0,available_actions=[SimpleNamespace(name="ACTION1")]);o=a._obs(raw);assert len(o.transient_frames)==1 and int(o.frame[0,0])==1
