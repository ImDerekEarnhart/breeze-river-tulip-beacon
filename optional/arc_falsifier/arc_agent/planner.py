from __future__ import annotations
from collections import deque
class BFSPlanner:
    def plan(self,state,actions,transition,goal,max_depth=12):
        q=deque([(state,[])]);seen={state.signature() if hasattr(state,"signature") else repr(state)}
        while q:
            s,p=q.popleft()
            if goal(s):return p
            if len(p)>=max_depth:continue
            for a in actions(s):
                ns=transition(s,a)
                if ns is None:continue
                k=ns.signature() if hasattr(ns,"signature") else repr(ns)
                if k in seen:continue
                seen.add(k);q.append((ns,p+[a]))
        return None
