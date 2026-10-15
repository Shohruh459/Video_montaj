#!/usr/bin/env python3
"""To'g'rilangan o'zbekcha matnni nutqqa vaqt bo'yicha moslash (forced alignment, torchaudio MMS_FA, CTC).
Ishlatish: .venv/bin/python scripts/align_uz.py <video|audio> <matn.txt> <chiqish_prefiksi> [--ss N] [--t N]
matn.txt: har QATOR = bitta subtitr qatori (<=42 belgi), nutq tartibida, TASDIQLANGAN matn.
Chiqadi: <prefiks>.json (har so'z t0/t1/ball), <prefiks>.srt, <prefiks>.report.txt (past ballli so'zlar — ko'z bilan tekshir).
--ss/--t berilsa vaqtlar manba videoning mutlaq soniyasida chiqadi (offset qo'shiladi); --rel — nisbiy (0 dan).
Eslatma: MMS_FA modeli CC-BY-NC (Meta, HF: MahmoudAshraf) — ichki vosita, subtitr matni/vaqti mahsulot emas; shubha bo'lsa mijozga ayt."""
import sys, json, argparse, subprocess, pathlib, re
import numpy as np, torch, torchaudio
from transformers import AutoModelForCTC
MID = 'MahmoudAshraf/mms-300m-1130-forced-aligner'  # MMS_FA ning HF nusxasi (torchaudio vaznlari tarmoqda yopiq)
ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("txt"); ap.add_argument("out"); ap.add_argument("--ss", default="0"); ap.add_argument("--t", default=None); ap.add_argument("--rel", action="store_true"); a = ap.parse_args()
cmd = ["ffmpeg", "-v", "error", "-ss", a.ss] + (["-t", a.t] if a.t else []) + ["-i", a.src, "-vn", "-ar", "16000", "-ac", "1", "-f", "f32le", "-"]
wav = torch.from_numpy(np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).copy())[None]
off = 0.0 if a.rel else float(a.ss)
import json as _j, urllib.request as _u
from huggingface_hub import hf_hub_download
D = _j.load(open(hf_hub_download(MID, 'vocab.json'), encoding='utf-8')); lines = [l.strip() for l in open(a.txt, encoding="utf-8") if l.strip()]
def toks(w):
    w = w.lower().replace("ʻ", "").replace("‘", "").replace("`", "").replace("ʼ", "'").replace("’", "'")
    return [D[c] for c in w if c in D and len(c) == 1]
words = [(li, w) for li, l in enumerate(lines) for w in l.split()]
tk = [toks(w) for _, w in words]; flat = [t for x in tk for t in x]
model = AutoModelForCTC.from_pretrained(MID).eval()
with torch.inference_mode():
    x = (wav - wav.mean()) / (wav.std() + 1e-7); em = torch.log_softmax(model(x).logits.float(), -1)
ali, sc = torchaudio.functional.forced_align(em, torch.tensor([flat], dtype=torch.int32), blank=0)
spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
fr = wav.shape[1] / em.shape[1] / 16000; res = []; k = 0
for (li, w), t in zip(words, tk):
    if not t: res.append({"line": li, "w": w, "t0": None, "t1": None, "score": 0}); continue
    s = spans[k:k + len(t)]; k += len(t)
    res.append({"line": li, "w": w, "t0": round(s[0].start * fr + off, 3), "t1": round(s[-1].end * fr + off, 3), "score": round(float(np.mean([x.score for x in s])), 3)})
for i, r in enumerate(res):  # tovushsiz so'zlar (raqam va h.k.) — qo'shnilar orasiga
    if r["t0"] is None:
        p = next((x["t1"] for x in reversed(res[:i]) if x["t1"] is not None), off); n = next((x["t0"] for x in res[i + 1:] if x["t0"] is not None), p); r["t0"], r["t1"] = p, n
def ts(t): h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60; return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")
out = pathlib.Path(a.out); json.dump({"words": res}, open(f"{out}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
srt = []; rep = []
for li, l in enumerate(lines):
    ws = [r for r in res if r["line"] == li]
    if len(l) > 42: rep.append(f"UZUN qator ({len(l)} belgi): {l}")
    if ws: srt.append(f"{li+1}\n{ts(ws[0]['t0'])} --> {ts(ws[-1]['t1'])}\n{l}\n")
open(f"{out}.srt", "w", encoding="utf-8").write("\n".join(srt))
rep += [f"past ball {r['score']:.2f} @ {r['t0']:.2f}s: {r['w']}" for r in res if r["score"] < 0.5]
open(f"{out}.report.txt", "w", encoding="utf-8").write("\n".join(rep) + "\n")
print(open(f"{out}.srt", encoding="utf-8").read()); print("--- hisobot:"); print("\n".join(rep) or "(past ballli so'z yo'q)")
