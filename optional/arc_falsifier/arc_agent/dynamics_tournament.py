from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import json
import numpy as np
from .types import Action
from .hypotheses import infer_effect_hypothesis

@dataclass(frozen=True)
class Row:
    row_id:str; pre:np.ndarray; post:np.ndarray; shape:str;color:int;position:int

def make_frame(shape:str,color:int,x:int)->np.ndarray:
    f=np.zeros((64,64),dtype=np.uint8)
    cells=[(20,x)] if shape=="single_cell" else [(20,x),(20,x+1)]
    for y,xx in cells:f[y,xx]=color
    return f

def make_rows(positions,tag):
    rows=[]
    for shape in ("single_cell","horizontal_domino"):
        for color in (2,5):
            for x in positions:
                rows.append(Row(f"{tag}_{shape}_{color}_{x}",make_frame(shape,color,x),make_frame(shape,color,x+2),shape,color,x))
    return rows

def absolute_edit_predictor(pre_train,post_train):
    edits=[(int(y),int(x),int(post_train[y,x])) for y,x in np.argwhere(pre_train!=post_train)]
    def pred(frame):
        out=np.asarray(frame,dtype=np.uint8).copy()
        for y,x,v in edits:out[y,x]=v
        return out
    return pred

def run(out="results/dynamics_tournament"):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    train=make_rows((4,8,12),"train");held=make_rows((20,28,36,44),"held")
    by_key={}
    for r in train:
        by_key.setdefault((r.shape,r.color),r)
    models={}
    for k,r in by_key.items():
        models[("absolute_pixel_edit",)+k]=absolute_edit_predictor(r.pre,r.post)
        h=infer_effect_hypothesis(r.pre,Action("ACTION1"),r.post,r.row_id)
        models[("rigid_object_translation",)+k]=lambda f,h=h:h.predictor(f,Action("ACTION1"))
    findings={name:{"correct":0,"total":0,"unknown":0,"false_confident":0,"rows":[]} for name in ("no_change","absolute_pixel_edit","rigid_object_translation")}
    for r in held:
        preds={
            "no_change":np.asarray(r.pre,dtype=np.uint8).copy(),
            "absolute_pixel_edit":models[("absolute_pixel_edit",r.shape,r.color)](r.pre),
            "rigid_object_translation":models[("rigid_object_translation",r.shape,r.color)](r.pre),
        }
        for name,p in preds.items():
            f=findings[name];f["total"]+=1
            if p is None:
                f["unknown"]+=1;ok=False
            else:
                ok=bool(np.array_equal(np.asarray(p,dtype=np.uint8),r.post));f["correct"]+=int(ok);f["false_confident"]+=int(not ok)
            f["rows"].append({"row_id":r.row_id,"correct":ok,"unknown":p is None})
    for f in findings.values():
        f["accuracy"]=f["correct"]/f["total"];f["coverage"]=(f["total"]-f["unknown"])/f["total"]
    primary=findings["rigid_object_translation"]["accuracy"]>=.95 and findings["rigid_object_translation"]["accuracy"]-findings["absolute_pixel_edit"]["accuracy"]>=.40 and findings["rigid_object_translation"]["false_confident"]==0
    result={"schema":"arc-dynamics-language-tournament-result/1","frozen_dataset_sha256":"1131968c911a583af92d7ae166fa2b5e15456f6a3c8dcc3da2c13cf28d122c5a","training_rows":len(train),"confirmation_rows":len(held),"findings":findings,"primary_success_check_passed":primary,"scope":"collision-free rigid moves only; synthetic controlled test; not ARC benchmark evidence"}
    (out/"result.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps({"training_rows":len(train),"confirmation_rows":len(held),"summary":{k:{z:v for z,v in f.items() if z!="rows"} for k,f in findings.items()},"primary_success_check_passed":primary},indent=2))
    return result
if __name__=="__main__":run()
