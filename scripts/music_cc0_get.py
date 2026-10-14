# music_cc0_scan.py natijasidan tanlangan (shard,row) treklarni yuklaydi (/tmp/music/raw). Har bir shard ~320 MB.
import json, pathlib, subprocess, pyarrow.parquet as pq
from huggingface_hub import HfFileSystem
fs=HfFileSystem(); N=591
cap={(a,b):t for a,b,t in json.load(open('/tmp/music/captions.json'))}
picks={ # (shard,row): (kod, kayfiyat)
 (0,0):'piano-torlar-melanxolik',(0,10):'skripka-ambient-sokin',(0,4):'elektron-ambient-tush',
 (1,5):'skripka-oylovchan',(1,9):'kino-torlar-hissiy',
 (14,10):'piano-torlar-aks',(14,7):'elektron-sirli',
 (33,7):'solo-piano-melanxolik',(54,1):'solo-piano-nostalgik',
 (28,12):'umidli-nay-torlar',(44,13):'ilhomli-orkestr-aks',
 (31,15):'dramatik-orkestr',(50,1):'kino-sirli-torlar'}
out=pathlib.Path('/tmp/music/raw'); out.mkdir(exist_ok=True); meta=[]
byshard={}
for (s,r),k in picks.items(): byshard.setdefault(s,[]).append((r,k))
for s,rows in sorted(byshard.items()):
    p=f'datasets/mrfakename/cc0-music-captioned/data/train-{s:05d}-of-{N:05d}.parquet'
    with fs.open(p,'rb') as f:
        tb=pq.ParquetFile(f).read(columns=['audio'])
    col=tb.column('audio').to_pylist()
    for r,k in rows:
        a=col[r]; b=a['bytes']; ext=(a.get('path') or 'x.mp3').rsplit('.',1)[-1].lower()
        fn=out/f's{s}_r{r}_{k}.{ext}'; fn.write_bytes(b)
        meta.append({'shard':s,'row':r,'kod':k,'file':fn.name,'caption':cap[(s,r)],'bytes':len(b)})
        print('OK',fn.name,len(b)//1024,'KB',flush=True)
json.dump(meta,open('/tmp/music/meta.json','w'),ensure_ascii=False,indent=1)
print('TAYYOR',len(meta))
