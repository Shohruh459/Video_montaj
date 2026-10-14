# Kinetic uslub shablonlari (Yuksalish Reels, 9:16, 1080×1920)

Har bir uslub **nom** bilan chaqiriladi. Hammasi bir xil kiritish ma'lumotidan (`src/data/sample.json`) ishlaydi:
har bir ibora (`lines[]`) = matn so'zlari + vaqt (ovozdan) + fon klip + teg. Ovoz va musiqa bitta `audio` fayl.

| Nom | Xarakter | Qachon ishlatiladi |
|---|---|---|
| `kino-oltin` | To'liq ekran qorong'i video, oltin yorug'lik, grain, kino qora chiziqlar | Hissiy, "kino" ssenariylar (vaqt, intizom, haqiqat) |
| `split-oyna` | Tepada video oyna, pastda katta matn, progress, wipe o'tish | Bilim/ro'yxat/qadamlar, ma'lumot ko'p ssenariylar |
| `jurnal` | Qora-oq foto kartochka, serif, qizil marker | Maslahat, iqtibos, "bilasizmi?" ssenariylar |
| `neon` | Neon cyan/magenta, glitch, skanlayn, REC HUD | Energik, yoshlar auditoriyasi, texnologiya |
| `minimal-oq` | Och fon, yumaloq video karta, amber chiziq | Tinch, o'qishga qulay, kunduzgi/ta'limiy ohang |
| `afisha` | Ulkan bosh harfli matn, duoton fon, oltin blok | Kuchli hook, qisqa urg'uli gaplar, 1-3 soniya e'tibor |

## Ishlatish
```bash
bash templates/kinetic/render.sh <nom> out.mp4 [scale=0.5] [props.json]
# scale 0.5 = 540x960 draft; scale 1 = 1080x1920 yakuniy
```
`render.sh` chiqishni `yuv420p` (tv diapazon), faststart qiladi (Remotion o'zi yuvj420p chiqaradi).

## Ma'lumot formati (`src/data/sample.json`)
```json
{"style":"neon","totalSec":12.8,"audio":"sample_mix.wav",
 "lines":[{"words":[{"t":"Vaqtingni"},{"t":"3–4","a":true}],"start":0.5,"dur":3.0,
           "clip":"c_watch.mp4","pos":"50% 50%","tag":"VAQT"}]}
```
- `a:true` — urg'u so'zi (har uslubda o'z ko'rinishida: rang/marker/blok/chiziq).
- `start`/`dur` — ovoz qatorlari uzunligidan (`tts_vs.synth_line` + ffprobe).
- `clip` va `audio` fayllari `public/` da (media gitga kirmaydi).
- So'zlar ovozga belgi uzunligi bo'yicha taxminan sinxron chiqadi.

## Yangi uslub qo'shish
`src/Sample.tsx`: komponent yoz → `STYLES` ro'yxatiga nom qo'sh → `Sample` ichidagi tanlovga ulang.
Qoidalar: matn yon tomondan ≥ 8% (≈ 85 px), eng uzun so'zni shrift o'lchamiga moslashtir (`maxW`), 
yuqori/pastki 10% xavfsiz zona, `Phrase`/`Clip`/`Grain` yordamchilaridan foydalan.

## Cheklovlar
- Pixabay "medium" ko'pincha 720p: yakuniy render uchun `fetch_broll.py ... --quality large`.
- Ovoz: V4 profili (OmniVoice, CC-BY-NC) — faqat demo; tijoriy ish uchun ovoz yo'li alohida.
