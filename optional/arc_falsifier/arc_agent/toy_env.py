from __future__ import annotations
import numpy as np
from .types import Action,FrameObservation
class ToggleMoveEnv:
    """Visible state can repeat while ACTION1 changes meaning with hidden ACTION2 parity."""
    def __init__(self,initial_x=4,target_x=14):self.game_id="toy_hidden_mode";self.level=0;self.initial_x=initial_x;self.target_x=target_x;self.hidden=False;self.x=initial_x;self.turn=0
    def _frame(self):
        f=np.zeros((64,64),dtype=np.uint8);f[8,self.x]=2;f[8,self.target_x]=4;return f
    def _obs(self,state="PLAYING"):return FrameObservation(self._frame(),("ACTION1","ACTION2"),self.game_id,self.level,state,[])
    def reset(self):self.hidden=False;self.x=self.initial_x;self.turn=0;return self._obs()
    def step(self,a:Action):
        if a.name=="ACTION2":self.hidden=not self.hidden
        elif a.name=="ACTION1" and self.hidden:self.x=min(self.target_x,self.x+2)
        self.turn+=1;return self._obs("WIN" if self.x>=self.target_x else "PLAYING")

class MultiPhaseToggleEnv:
    """Harder family: the required toggle phase changes after crossing a visible checkpoint.

    Before checkpoint: ACTION1 moves iff ACTION2 parity is odd.
    After checkpoint: ACTION1 moves iff ACTION2 parity is even.
    The checkpoint is visible, but phase parity is history-derived.
    """
    def __init__(self,initial_x=4,checkpoint_x=12,target_x=22):self.game_id="toy_multiphase";self.level=0;self.initial_x=initial_x;self.checkpoint_x=checkpoint_x;self.target_x=target_x;self.toggle_count=0;self.x=initial_x;self.turn=0
    def _frame(self):
        f=np.zeros((64,64),dtype=np.uint8);f[8,self.x]=2;f[10,self.checkpoint_x]=3;f[8,self.target_x]=4;return f
    def _obs(self,state="PLAYING"):return FrameObservation(self._frame(),("ACTION1","ACTION2"),self.game_id,self.level,state,[])
    def reset(self):self.toggle_count=0;self.x=self.initial_x;self.turn=0;return self._obs()
    def step(self,a:Action):
        if a.name=="ACTION2":self.toggle_count+=1
        elif a.name=="ACTION1":
            pre=self.x<self.checkpoint_x; active=(self.toggle_count%2==1) if pre else (self.toggle_count%2==0)
            if active:self.x=min(self.target_x,self.x+2)
        self.turn+=1;return self._obs("WIN" if self.x>=self.target_x else "PLAYING")
