# CC0 musiqa qidirish (HF: mrfakename/cc0-music-captioned): 1) bu skript hamma tavsiflarni /tmp/music/captions.json ga yozadi; 2) tavsifni kayfiyat bo'yicha filtrla; 3) music_cc0_get.py da picks ni to'ldirib audio yuklaydi. Kerak: pip install pyarrow huggingface_hub
import json, concurrent.futures as cf, pyarrow.parquet as pq
from huggingface_hub import HfFileSystem
fs=HfFileSystem(); N=591
def scan(i):
    p=f'datasets/mrfakename/cc0-music-captioned/data/train-{i:05d}-of-{N:05d}.parquet'
    for a in range(3):
        try:
            with fs.open(p,'rb') as f:
                return [(i,j,t) for j,t in enumerate(pq.ParquetFile(f).read(columns=['text']).column('text').to_pylist())]
        except Exception as e: err=str(e)
    return [(i,-1,'ERR '+err[:80])]
out=[]
with cf.ThreadPoolExecutor(10) as ex:
    for k,r in enumerate(ex.map(scan,range(N))):
        out+=r
        if k%100==0: print(k,len(out),flush=True)
json.dump(out,open('/tmp/music/captions.json','w'),ensure_ascii=False)
print('TAYYOR',len(out),'xato',sum(1 for x in out if x[1]<0))
