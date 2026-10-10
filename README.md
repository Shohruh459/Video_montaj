# Video Montaj
Buyurtma asosida video montaj. Qoidalar — `CLAUDE.md`.

```bash
bash scripts/setup.sh                       # server tayyorlash
python scripts/tts_uz.py matn.txt voice.mp3 # o'zbekcha ovoz
scripts/normalize_audio.sh voice.mp3 voice.wav
scripts/export.sh in.mp4 out.mp4 vertical   # yoki horizontal
scripts/qc.sh out.mp4
```
