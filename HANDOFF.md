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

## Sessiya 2026-10-11 tekshiruvi (Zarafshon Dasturchilari, 5 ta Reels, ayol ovoz)
- Brif fayli: foydalanuvchi yuklagan `Zarafshon_Dasturchilari_AI_Ssenariylar.html` (5 ssenariy, 15–35 s, ayol ovoz, 9:16 Reels).
- `.venv` + `requirements.txt` o'rnatildi (edge-tts, pydub, pyloudnorm, soundfile). ffmpeg 6.1 bor. Shrift: DejaVu bor, Noto Sans yo'q (apt tarmog'i tekshirilmagan).
- **edge-tts ISHLAMAYDI**: `speech.platform.bing.com` DNS/proksi bloklangan (tarmoq siyosati). Environment sozlamalarida shu domen ruxsat etilishi kerak.
- Pixabay API (rasm/video) ishlaydi, `cdn.pixabay.com` dan video yuklash ishlaydi (200). Pixabay **musiqa** uchun rasmiy API yo'q, `pixabay.com` sayti 403.
- Bloklangan: api.elevenlabs.io, freesound.org, incompetech.com. Ochiq: huggingface.co, pypi.org, npm, archive.org.
- Zaxira TTS: HuggingFace `facebook/mms-tts-uzb-script_cyrillic` (kirill yozuv kerak, sifat past).

### 2026-10-12 — 5 ta draft tayyor (`projects/zarafshon-2026-10-11/`)
- Pipeline: `python scripts/make_reel.py N [--final] [--shots]` (N=1..5). Ovoz `scripts/tts_mms.py` (lotin→kirill + MMS, ayol modeli), musiqa sintez, vizual PIL, subtitr xavfsiz zonada. Draftlar 540x960; QC: −14 LUFS, qora kadr/jimlik yo'q.
- **Ovoz sifati MUAMMO**: MMS ovozi robotroq, talaffuz xato bo'lishi mumkin (ASR o'xshashligi ~0.6). Hali hech kim eshitib tasdiqlamagan. MMS asosi CC-BY-NC → tijoriy ishda litsenziya tekshirilsin. Yaxshiroq yo'l: edge-tts domeni (`speech.platform.bing.com`) ruxsati yoki Google Cloud TTS (`texttospeech.googleapis.com` ochiq, API kalit kerak) yoki jonli diktor.
- Brend logotiplari (Cursor/Claude/ChatGPT) ishlatilmadi — faqat matn kartalari. Musiqa original sintez (aslida oddiy; yaxshi trek bersa almashtiramiz).
- Reel 2 (32.5 s) va 3 (34.8 s) mijoz taxminidan uzunroq.

### 2026-10-13 — v2 uslub (retention) va natija kuzatuvi
- Instagram (1-reel eski versiya): 250 ko'rish, o'rtacha 3 s, 3-soniyada ~80% ketgan, layk/izoh 0 → muammo birinchi 3 s. Yechim: hook birinchi, haqiqiy fon kadrlari (Pixabay, `broll/`), kinetik matn, tez kesish.
- v2 ssenariylar: `01v2`…`05v2` (`scenarios.py`), `python scripts/make_reel.py 05v2`. Ovoz: OmniVoice (asosiy ayol, litsenziya qabul qilingan, faqat demo), keshi matn xeshi bo'yicha `voice/vs_<md5>.wav`. Backend: `bash scripts/start_voice.sh` (har sessiyada qayta; VoiceStudio klon `/home/user/debpalash/voicestudio`, o'rnatish ~5 GB + model 3 GB — yangi sessiyada qayta kerak).
- Kutilmoqda: foydalanuvchi reellarni joylab, odamlar reaksiyasini (3-soniya ushlab turish, layk, izoh) aytadi → shunga qarab uslubni tanlaymiz. Keyin: 1080x1920 `--final`, 4K fon, SFX, musiqa manbasi.
- Ma'lum kamchiliklar: fon 1080p yumshoq; ba'zi kadrlar qorong'i; 3v2 "7-kun" sahnasida kalendar yozuvi ("Sat") matn bilan ustma-ust; reel 4 boshida fon qorong'i.

### So'z tanlash qoidasi (foydalanuvchi aytdi)
- "asbob" so'zi ba'zi o'zbek auditoriyasida noto'g'ri (nojo'ya) ma'no beradi → **ishlatma**, o'rniga "vosita". `scenarios.py` da almashtirilgan, 04v2 qayta yig'ilgan. Yangi matnlarda ham shunday ikki ma'noli so'zlarni tekshir; shubha bo'lsa foydalanuvchidan so'ra.

### 2026-10-14/15 — 3D hooklar va yangi ssenariylar (N1–N6)
- Ssenariylar `scenarios.py` oxirida: N1 (ruletka hook), N2 (kalendar, 1 kun), N3 (svetofor), N4 (tarozi), N5 (kalendar, 7 kun), N6 (tarozi). Ishga tushirish: `python scripts/make_reel.py N3` (`--final` = 1080x1920). `intro=dict(kind=tape|scale|calendar|traffic, say, card, n_pages, blocks)`.
- 3D hooklar: `templates/tape/` (`common.js`, `tape.html`, `scale.html`, `calendar.html`, `traffic.html`, `render.mjs`, `build_hook.py`) — three.js, headless Chromium (SwiftShader, GPU kerak emas), SFX dasturiy sintez. Stems keshi: `projects/.../hook/<xesh>/`.
- Ekran kadrlari (o'zimiz yasagan): `templates/screens/` (`screens.html`, `render_page.mjs`) → `broll/own_{code,chat,term_fail,term_ok}.mp4`. Ssenariyda `bg=("own_chat.mp4", ss), braw=True, scene=NONE` (ekran ustiga matn qo'ymaymiz).
- Pixabay: tez-tez 429 (CDN) beradi — kichik partiyalar bilan yukla. Mavzu bo'yicha kadrlar `broll/` da (media gitga kirmaydi; yangi sessiyada `fetch_broll.py get <id>` bilan qayta yukla).
- Hali eshitilmagan: hooklarning SFX balansi. Final (1080x1920) renderlar qilinmagan.

## Qoidalar eslatmasi
- Kalitlarni hech qachon chatga chiqarma (faqat nomini tekshir).
- Kadrlarni yuklagach ko'zdan kechir, brend logotipli boshqa mashina kadrlarini olma, 4–6 ta eng yaxshisini ko'rsat.
- Tayyor faylni `SendUserFile` bilan yubor (media gitga kirmaydi).

## Keyingi qadamlar
1. Brifni to'ldir (yuqoridagi so'rovlar) — kerak bo'lsa foydalanuvchiga qisqa so'ra.
2. `python scripts/fetch_broll.py search "electric car" --type video` → tanla → `get` bilan `projects/byd-2026-10-10/broll` ga yukla.
3. O'zbekcha matn (raqamlar so'z bilan) → ovoz namunasi → Kinocut bilan montaj → `export.sh` → `qc.sh` → foydalanuvchiga yubor.
