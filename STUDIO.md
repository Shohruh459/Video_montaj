# Studio — qaror va sozlamalar (foydalanuvchi tasdiqlagan)

Yangi sessiya/server: `bash scripts/setup.sh` → keyin `HANDOFF.md` ni o'qi.

## Tanlangan stack
- **Montaj/eksport/QC:** ffmpeg 6.1 (`scripts/export.sh`, `scripts/qc.sh`, `scripts/normalize_audio.sh`)
- **Tezkor draft:** ffmpeg + drawtext (`projects/<loyiha>/build_draft.py`, ~7 s)
- **Motion grafika (tasdiqlangan "shu yoqdi"):** Remotion 4.0.250 — `templates/remotion`
  (animatsiyali sarlavha, lower-third, CTA, Ken Burns, crossfade). Sahnalar `projects/<loyiha>/scenes.json` da.
  Render: `node templates/remotion/render.mjs <scenes.json> <out.mp4> [scale=0.5] [crf=23]`
- **B-roll:** Pixabay API (`scripts/fetch_broll.py`, kalit `PIXABAY_API_KEY`, `CREDITS.md` avtomatik)
- **Dizayn:** shrift Noto Sans/DejaVu, aksent `#35d6c0`, pastki xavfsiz zona 300 px (1080x1920)

## Ma'lum cheklovlar
- GPU yo'q: Remotion draft (540x960, 30 s) ≈ 2 daq.
- Remotion chiqishi `yuvj420p` → yakuniy eksportda `yuv420p` ga qayta kodlash.
- Brauzer: Playwright `chromium_headless_shell` (render.mjs o'zi topadi, `CHROMIUM_PATH` bilan almashtiriladi).
- Tarmoq: bu sandbox'da Microsoft/ElevenLabs/Azure TTS manzillari yopiq.
