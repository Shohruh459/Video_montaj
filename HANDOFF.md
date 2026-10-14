# HANDOFF — loyiha holati (har yangi sessiya BIRINCHI shuni o'qisin)

Yangilangan: 2026-10-10. Foydalanuvchi o'zbekcha gaplashadi (lotin), duo/"Bismillah" bilan boshlaydi — hurmat bilan javob ber.
Maqsad: buyurtmaga sifatli video montaj (motion, AI video, sifatli o'zbekcha ovoz). Qoidalar — `CLAUDE.md`.

## Hozirgi vazifa
Namuna rolik: **BYD Song Plus** avtomobili (demo, rasmiy bog'liqliksiz). Foydalanuvchi vositalar nimaga qodirligini ko'rmoqchi.
Hali foydalanuvchidan olinmagan brif: format (9:16 / 16:9), davomiylik (15/30 s), ovoz (ayol/erkak), matn kimdan, ranglar/logo/kontakt.
Pixabay'da Song Plus'ning o'zi ehtimol yo'q → umumiy elektromobil kadrlari; aniq model uchun rasmiy/diler materiali kerak. Aniq texnik raqamlarni taxmin qilma.

## Tekshirilgan faktlar
- Muhit: 4 CPU, 15 GB, GPU yo'q, ffmpeg 6.1. `scripts/export.sh` va `scripts/qc.sh` sinalgan va ishlaydi.
- **Kinocut** (PyPI `kinocut`, CLI `kino`) sinaldi: merge (fade), add-text, add-audio, video-quality-check ishladi; o'zbekcha `Oʻ/Gʻ` to'g'ri chiqdi. Kamchilik: matn uzun bo'lsa ekran chetidan kesiladi (xavfsiz zonani qo'lda ber: kichikroq `--size` yoki qatorga bo'l). Sinovdan keyin o'chirilgan — kerak bo'lsa `pip install kinocut` (venv ichida).
- **vedit**: sinalmadi (ishga tushirish ruxsat tizimi tomonidan rad etilgan). Foydalanuvchi ruxsat berguncha urinma.
- **Higgsfield MCP**: balans **0 kredit**, free tarif → AI video generatsiya qilib bo'lmaydi. Kredit sarflashdan oldin narxni ayt va tasdiq ol.
- **Microsoft TTS (edge-tts)**: avvalgi sandbox'da ulanmadi (proksi/sertifikat). Foydalanuvchining serverida/yangi sessiyada qayta sinab ko'r; ishlamasa — boshqa TTS variantini taklif qil. Hali hech bir o'zbekcha ovoz eshittirilmagan.
- **Pixabay**: `pixabay.com` sayti Cloudflare bot-tekshiruvi beradi (403); rasmiy API (`/api/`, `/api/videos/`) kalit bilan ishlaydi. Kalit muhitda `PIXABAY_API_KEY` nomi bilan (foydalanuvchi qo'shgan; eski sessiyada ko'rinmagan, yangisida ishlagani foydalanuvchi xabari bo'yicha). Skript: `scripts/fetch_broll.py` (qidirish → tanlash → yuklash; `CREDITS.md` ni o'zi yozadi). Yuklash qismi hali haqiqiy tarmoqda sinalmagan.

## Qoidalar eslatmasi
- Kalitlarni hech qachon chatga chiqarma (faqat nomini tekshir).
- Kadrlarni yuklagach ko'zdan kechir, brend logotipli boshqa mashina kadrlarini olma, 4–6 ta eng yaxshisini ko'rsat.
- Tayyor faylni `SendUserFile` bilan yubor (media gitga kirmaydi).

## Keyingi qadamlar
1. Brifni to'ldir (yuqoridagi so'rovlar) — kerak bo'lsa foydalanuvchiga qisqa so'ra.
2. `python scripts/fetch_broll.py search "electric car" --type video` → tanla → `get` bilan `projects/byd-2026-10-10/broll` ga yukla.
3. O'zbekcha matn (raqamlar so'z bilan) → ovoz namunasi → Kinocut bilan montaj → `export.sh` → `qc.sh` → foydalanuvchiga yubor.

## 2026-10-14 — Yuksalish (@yuksalish713) Reels
- Remotion shablon: `templates/kinetic` (data: `src/data/ssenariy1.json`; render: `npx remotion render src/index.ts Reel out.mp4 --scale=0.5`). Chrome: `chromium_headless_shell-1194` (remotion.config.ts). Font: DejaVu Sans Bold (oʻ/gʻ to'g'ri).
- Ssenariy 1 draft (ovozsiz) tayyor: `projects/yuksalish-2026-10-14/out/` (gitda yo'q).
- BLOK: `speech.platform.bing.com` tarmoq siyosati bilan bloklangan → edge-tts ishlamaydi. Foydalanuvchi hostni Allowed domains ga qo'shishi yoki o'z ovoz yozuvini berishi kerak.
- Draft pix_fmt yuvj420p chiqdi — yakuniy renderda `--pixel-format=yuv420p` + export.sh orqali yuv420p ga o'tkaz.
- Ssenariy 1 faktini tuzatdim: 730 soat ≈ 3 oylik ish kuni (asl matnda "1 oylik"). Mijoz tasdig'i kerak.
