from __future__ import annotations
from dataclasses import dataclass
from collections import deque
import numpy as np

@dataclass(frozen=True, slots=True)
class ObjectCandidate:
    object_id: str
    color: int
    cells: frozenset[tuple[int,int]]
    bbox: tuple[int,int,int,int]
    centroid: tuple[float,float]
    area: int
    holes: int
    orientation: str

def _holes(mask: np.ndarray) -> int:
    h,w=mask.shape; seen=set(); q=deque()
    for y in range(h):
        for x in (0,w-1):
            if not mask[y,x] and (y,x) not in seen: seen.add((y,x)); q.append((y,x))
    for x in range(w):
        for y in (0,h-1):
            if not mask[y,x] and (y,x) not in seen: seen.add((y,x)); q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<h and 0<=xx<w and not mask[yy,xx] and (yy,xx) not in seen:
                seen.add((yy,xx)); q.append((yy,xx))
    unseen={(y,x) for y in range(h) for x in range(w) if not mask[y,x] and (y,x) not in seen}
    n=0
    while unseen:
        n+=1; start=unseen.pop(); q=deque([start])
        while q:
            y,x=q.popleft()
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                p=(y+dy,x+dx)
                if p in unseen: unseen.remove(p); q.append(p)
    return n

def extract_objects(frame: np.ndarray) -> list[ObjectCandidate]:
    a=np.asarray(frame,dtype=np.uint8); seen=np.zeros_like(a,dtype=bool); out=[]; oid=0
    for y in range(64):
        for x in range(64):
            if seen[y,x] or a[y,x]==0: continue
            c=int(a[y,x]); q=deque([(y,x)]); seen[y,x]=True; cells=[]
            while q:
                yy,xx=q.popleft(); cells.append((yy,xx))
                for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny,nx=yy+dy,xx+dx
                    if 0<=ny<64 and 0<=nx<64 and not seen[ny,nx] and int(a[ny,nx])==c:
                        seen[ny,nx]=True; q.append((ny,nx))
            ys=[p[0] for p in cells]; xs=[p[1] for p in cells]
            y0,y1,x0,x1=min(ys),max(ys),min(xs),max(xs)
            mask=np.zeros((y1-y0+1,x1-x0+1),dtype=bool)
            for yy,xx in cells: mask[yy-y0,xx-x0]=True
            hh,ww=mask.shape; orient="point" if len(cells)==1 else ("horizontal" if ww>hh else "vertical" if hh>ww else "square")
            out.append(ObjectCandidate(f"o{oid}",c,frozenset(cells),(y0,x0,y1,x1),(float(np.mean(ys)),float(np.mean(xs))),len(cells),_holes(mask),orient)); oid+=1
    return out

def relations(objects: list[ObjectCandidate]) -> list[dict]:
    out=[]
    for i,a in enumerate(objects):
        for b in objects[i+1:]:
            ay0,ax0,ay1,ax1=a.bbox; by0,bx0,by1,bx1=b.bbox
            dy=b.centroid[0]-a.centroid[0]; dx=b.centroid[1]-a.centroid[1]
            out.append({"a":a.object_id,"b":b.object_id,"same_color":a.color==b.color,"row_aligned":abs(dy)<.5,"col_aligned":abs(dx)<.5,"centroid_manhattan":abs(dy)+abs(dx),"overlap_bbox":not (ay1<by0 or by1<ay0 or ax1<bx0 or bx1<ax0)})
    return out
