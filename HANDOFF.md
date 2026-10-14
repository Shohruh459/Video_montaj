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

## 2026-10-14 — Yuksalish (@yuksalish713) Reels
- Remotion shablon: `templates/kinetic` (data: `src/data/ssenariy1.json`; render: `npx remotion render src/index.ts Reel out.mp4 --scale=0.5`). Chrome: `chromium_headless_shell-1194` (remotion.config.ts). Font: DejaVu Sans Bold (oʻ/gʻ to'g'ri).
- Ssenariy 1 draft (ovozsiz) tayyor: `projects/yuksalish-2026-10-14/out/` (gitda yo'q).
- BLOK: `speech.platform.bing.com` tarmoq siyosati bilan bloklangan → edge-tts ishlamaydi. Foydalanuvchi hostni Allowed domains ga qo'shishi yoki o'z ovoz yozuvini berishi kerak.
- Draft pix_fmt yuvj420p chiqdi — yakuniy renderda `--pixel-format=yuv420p` + export.sh orqali yuv420p ga o'tkaz.
- Ssenariy 1 faktini tuzatdim: 730 soat ≈ 3 oylik ish kuni (asl matnda "1 oylik"). Mijoz tasdig'i kerak.

## 2026-10-14 (kech) — ovoz backendi qayta o'rnatildi
- `.claude/settings.json` ga setup-api/start_voice/tts_vs ruxsat qoidalari qo'shildi (aks holda tashqi repo skripti rad etiladi).
- VoiceStudio klon + `node scripts/setup-api.mjs` (uv, torch CPU) + model `k2-fsa/OmniVoice` (3267 MB) o'rnatildi; `/health` ok. Yangi sessiyada hammasi qayta kerak.
- **BLOK:** `config/voice_ref/asosiy_ayol_past.wav` yo'q (`*.wav` gitignore edi, hech qachon commit bo'lmagan). Faqat `.txt` bor. Foydalanuvchi tanlagan namuna (`vtest_2_ayol_past`) fayli kerak — usiz asosiy ovoz profili yaratib bo'lmaydi. Boshqa ovoz/seed bilan almashtirma. Endi `.gitignore` da `!config/voice_ref/*.wav` istisno bor.

### 2026-10-14 — ASOSIY OVOZ ALMASHTIRILDI (foydalanuvchi tanladi: V4)
- Yangi asosiy ovoz: `ASOSIY-ayol-orta` (ayol, o'rta balandlik, yosh; OmniVoice instruct, seed 11). Tayanch namuna `config/voice_ref/asosiy_ayol_orta.wav` (gitda, `!config/voice_ref/*.wav`). Eski `ASOSIY-ayol-past` namunasi yo'qolgan edi → yuqoridagi BLOK yopildi.
- Litsenziyalar (OmniVoice CC-BY-NC, higgs tokenizer NOASSERTION) foydalanuvchi so'zi bilan FAQAT demo/namuna uchun qabul qilindi: `POST /models/licenses/accept` (repo_id + fingerprint, har yangi o'rnatishda qayta). Tijoriy yakuniy ish uchun ovoz yo'li alohida hal qilinadi.
- Matnni `tts_vs.py` ga bering: har QATOR alohida generatsiya (bir qator ≈ 1 daq CPU da). Namuna: `projects/yuksalish-2026-10-14/voice/`.
- **Ovoz postfiltri (A) STANDART** (foydalanuvchi tanladi, "g'in" hushtagi yo'qoldi): `scripts/tts_vs.py` -> `clean_audio()` har `synth_line()` natijasiga qo'llanadi (highpass 70 Hz + bandreject 8000/9770/6900 Hz, Q=12). Sabab: sintezator artefakti 8 kHz da. O'chirish: `VOICE_POSTFILTER=0` yoki voice.json `"postfilter": ""`. Eslatma: `make_reel.py` keshi (`voice/vs_<md5>.wav`) eski, FILTRSIZ fayllarni saqlaydi — eski kesh bo'lsa o'chirib qayta generatsiya qil.

### 2026-10-14 — Uslub namunalari (Yuksalish, 1-ssenariy 3 gap)
- `templates/kinetic/src/Sample.tsx`: 3 uslub (`style`: gold | split | editorial), ma'lumot `src/data/sample.json` (vaqtlar ovoz uzunligidan). Yig'ish skripti loyiha ichida emas: ovoz (har qator alohida `tts_vs.synth_line`) -> voice_full.wav + sintez pad (sidechain) -> loudnorm -14 LUFS -> `public/sample_mix.wav`; kliplar `public/c_*.mp4` (gitda yo'q).
- Render: `npx remotion render src/index.ts Sample out.mp4 --props=<json> --scale=0.5`; chiqish yuvj420p -> ffmpeg bilan `scale=in_range=pc:out_range=tv,format=yuv420p` qayta kodla.
- Pixabay "medium" = 720p (ba'zilari 1440p) — yakuniy 1080x1920 uchun `--quality large` yuklab ol, aks holda yumshoq.
- tts_vs.clean_audio endi faylga yozadi (pipe WAV sarlavhasi uzunlikni 'noma'lum' qoldirardi).
- Foydalanuvchi uslubni tanlashi kutilmoqda.
- **Uslub kutubxonasi (6 nom):** `templates/kinetic/STYLES.md` — kino-oltin, split-oyna, jurnal, neon, minimal-oq, afisha. Chaqirish: `bash templates/kinetic/render.sh <nom> out.mp4 [scale] [props.json]`. Skill qilish: foydalanuvchi tanlagan uslub(lar) asosida qoidalarni yoz.
- Uslublar 9 ta: + `terminal`, `shisha`, `daftar` (STYLES.md). Xato tuzatildi: sample.json 3-ibora urg'usi endi "3–4 soatni" (avval indeks xato edi: "soatni hech"). Eslatma: ma'lumot tayyorlashda urg'u indekslarini so'zlar ro'yxatiga qarab tekshir.
