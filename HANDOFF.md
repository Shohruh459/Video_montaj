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
- **QOIDA (foydalanuvchi tasdiqladi):** uslub videoga qarab tanlanadi, aralash uslub mumkin (iboraga `style`), mavzuga yangi uslub kerak bo'lsa yasab namuna bilan sinaymiz. `.claude/skills/reels-uslub/SKILL.md` + CLAUDE.md §7. Aralash demo: afisha→kino-oltin→shisha ishladi (qora kadr yo'q).

### 2026-10-14 (kech) — YANGI 12 ssenariy (v2) va fon musiqa
- Eski "Vaqt va 2 soat" bekor. Yangi: `projects/yuksalish-2026-10-14/script.md` (12 "Siz" ssenariysi v2: hook/mikro-qadam/sezgir mavzularga qo'shimcha gap tahrirlangan; foydalanuvchi tasdig'i kutilmoqda). Boshlash: #1.
- Fon musiqa: `scripts/music_cc0_scan.py` + `music_cc0_get.py` (HF CC0 dataset, kayfiyat bo'yicha). 10 ta variant `projects/.../music/preview/M1..M10.mp3` (32 s, -18 LUFS) + `preview_meta.json`. Foydalanuvchi tanlashi kutilmoqda; tanlangach CREDITS.md ga trek yozilsin.
- Aralash uslub (iboraga `style`) ishlaydi; qoida: `.claude/skills/reels-uslub/SKILL.md`.

### 2026-10-14 (kech) — #01 draft tayyor
- Spec: `projects/yuksalish-2026-10-14/specs/01.json` -> `python3 scripts/build_reel_k.py <spec> [--scale 1]` (ovoz kesh + miks + render; `scripts/reel_voice.py` faqat ovoz). Draft: `out/reel_01_draft.mp4` (29.1 s, afisha->kino-oltin, musiqa M5). QC toza (-13.8 LUFS, qora kadr yo'q).
- Foydalanuvchi M2 va M9 dan boshqa musiqani menga qoldirdi (M5 tanlandi). Draft ovoz/talaffuzi foydalanuvchi tomonidan eshitilishi kutilmoqda; keyin `--scale 1` yakuniy.
- Tuzatilgan xatolar: birinchi 0.5 s qora (endi 0-kadrdan klip), 6-ibora urg'usi, qora budilnik klipi/inglizcha kalendar/ayiqchali klip rad etildi. QOIDA: har klipni kadr bilan tekshir; builder urg'u so'zlarini [qavs] bilan chop etadi — tekshir.
- Backend har sessiyada o'chadi: `bash scripts/start_voice.sh`; model idle bo'lsa qayta yuklanadi (~1-2 daq).

### 2026-10-15 — "wow" montaj: harakat sahna kutubxonasi (#01v2)
- Foydalanuvchi #01 draftni eshitdi ("ajoyib"), to'liq ekran, o'zimiz chizgan sahnalar yo'nalishini tanladi. Yangi uslub `harakat` + 5 sahna (days, back, stop, task, panorama) `templates/kinetic/src/Sample.tsx`; spec `specs/01v2.json` -> `out/reel_01v2_draft.mp4` (29 s, QC toza, -13.8 LUFS).
- builder: `scenes` (ovoz iboralariga bog'langan vaqtlar), `sfx` (numpy bilan sintez: tick/thud/type/chime/whoosh), klipsiz iboralar.
- Ilhom manbasi: foydalanuvchi ko'rsatgan Reels (alexandro_ai) skrinshotlari — faqat texnika (har fikrga vizual metafora, 3D panorama, yagona dizayn tizimi); mazmun/brend nusxalanmadi.
- Kutilmoqda: foydalanuvchi fikri (ritm, SFX balansi, sahnalar). Keyin `--scale 1` yakuniy + #03 uchun yangi sahnalar (ikki yo'l, va h.k.).

### 2026-10-15 — Zarafshon: mushukchalar hadiyaga (client ish)
- Loyiha: `projects/zarafshon-mushuk-2026-10-15/` (spec `specs/01.json`, CREDITS.md). Pipeline: `python3 scripts/build_mushuk.py <spec> [--scale 1] [--alt]` (video 720p->1080x1920 yaxshilash, `scripts/sfx_synth.py` SFX (13 tur: boing/pop/sparkle/heart/ring...), musiqa miksi, Remotion kompozitsiya `Mushuk` (`templates/kinetic/src/Mushuk.tsx`)).
- Draft 24 s: `out/mushuk_01_draft.mp4` (musiqa A) va `_musiqaB.mp4`. QC toza. Telefon raqami kartada TO'LIQ ko'rinishi tekshirilgan (avval o'ng chetdan kesilgan edi).
- Kutilmoqda: mijoz fikri; "yana bor" ma'nosi (yana mushukchalar bormi / yana video bormi); ovozli matn kerakmi (V4 demo, CC-BY-NC); musiqa A/B tanlovi; haqiqiy faktlar (yoshi, nechta) — aniqlanmaguncha yozuvga qo'shilmadi.

### 2026-10-15 — #01 yakuniy + #03 draft
- #01v2 YAKUNIY: `projects/yuksalish-2026-10-14/out/reel_01v2_final.mp4` (1080x1920, 29 s, AAC 256k/48k, -13.8 LUFS). Izoh: `captions/01.md`. Builder endi audioni toza miksdan AAC 256k qilib qayta muxlaydi.
- #03 draft: `specs/03.json` -> `out/reel_03_draft.mp4` (32.2 s). Yangi sahnalar: fall, plan, zero, fork (3D Y-yo'l), bounce(up/stay), wave. `captions/03.md`. Musiqa: dramatik orkestr (31:15). Tasdiq kutilmoqda; keyin `--scale 1`.
- Navbat: #06, #10, #12, #08, #02, #07, #11, #04, #09, #05 (script.md). Har biri uchun mavzuga mos YANGI sahna(lar) yasash, namuna bilan.
- Eslatma: reel_voice.py ni ikki marta ishga tushirma (bitta jarayon ishlayotganini pgrep bilan tekshir).

### 2026-10-15 — #03 tasdiqlandi va yakuniy chiqarildi
- #03: `out/reel_03_final.mp4` (1080x1920, 32.2 s, -13.7 LUFS, TP -1.5, QC toza). Foydalanuvchi: "tushunarli, yetib boradigan, ajoyib". #01 va #03 izohlari `captions/01.md`, `captions/03.md`.
- Foydalanuvchi #01 va #03 ni Instagramga yuklaydi, keyin montajni davom ettiramiz. Navbat: #06, #10, #12, #08 (mavzuga mos yangi sahnalar, avval namuna).

### 2026-10-15 — #06 draft
- #06 `specs/06.json` -> `out/reel_06_draft.mp4` (31.7 s, QC toza). Yangi sahnalar: battery, flip (3D aylanuvchi kartochka), choice, timer, middle, week. Izoh `captions/06.md`. Musiqa M3 (piano+torlar). Tasdiq kutilmoqda; tekshirilmagan: "baʼzan" (tutuq ʼ) talaffuzi ovozda.
- Ovoz serveri paytida 400/429 berishi mumkin (model qayta yuklanayotganda yoki parallel so'rovlar). `bash scripts/voice_retry.sh <spec>` avtomatik qayta urinadi. Hech qachon backendga qo'lda parallel test so'rov yuborma (navbat to'lib 429 beradi).
- Navbat: #10, #12, #08, #02, #07, #11, #04, #09, #05.

### 2026-10-15 — #06: tushunarsiz ibora tuzatildi (ovoz sifati darsi)
- Muammo: "Savol shu: dam olayapsizmi, yoki qochayapsizmi?" tushunarsiz ("dam otaya yo qotaya"): model uzun qo'shimchali so'zlarni tez va uzluksiz aytib yutib yuboradi. Yechim (foydalanuvchi tanladi, variant F): ibora ikkiga bo'lingan: "Savol shu:" + (0.45 s pauza) + "Dam olyapsizmi, yoki qochyapsizmi?"; CTA ham "Hozir:" + shu bo'lak. Qisqa shakl ("olyapsizmi") ekranda ham.
- QOIDA: (1) uzun/qo'shimchali so'zli gaplarni bo'lak-bo'lak sintez qil, orasiga pauza qo'y; (2) foydalanuvchi eshitgan variantni qayta sintez qilma — model har safar biroz boshqacha chiqaradi (seed bir xil bo'lsa ham); tasdiqlangan faylni kesib ishlat (voice/cache/v_<md5>.wav ga qo'yiladi); (3) `scripts/asr_check.py` (Whisper-small) bilan nisbiy tushunarlilikni tekshir (so'z chegaralari ham); (4) ovozni to'liq yig'ishdan oldin foydalanuvchiga eshittir.
- #06 draft: `out/reel_06_draft.mp4` (32.5 s, QC toza). Builder: spec `tail` parametri qo'shildi.
- Foydalanuvchidan so'ralgan: #01/#03 da ham tushunarsiz joy bormi? (javob kutilmoqda)

### 2026-10-15 — #06 yakuniy
- `out/reel_06_final.mp4` (1080x1920, 32.6 s, -14.4 LUFS, TP -1.5, QC toza). Izoh `captions/06.md`. Navbat: #10, #12, #08, #02, #07, #11, #04, #09, #05. Yangi video uchun: ovozni IBORA-IBORA eshittirib tasdiq olib, keyin yig'.

### 2026-10-15/16 — Zarafshon dasturchilari: "AI montajchi" reklamasi, o'zbekcha ASR, ish e'loni
- **Montajchi** (`projects/zarafshon-montajchi-2026-10-15/`): `templates/kinetic/src/Montajchi.tsx` (comp `Montajchi`), `scripts/build_montajchi.py` (.venv), `specs/01.json`. Pastda haqiqiy video, tepada uslubli versiya (kino-oltin, neon, jurnal; 10 s dan), uslub e'loni kartasi paytida pastki video qotadi, oxirida CTA (ovoz: OmniVoice DEMO). Draft yuborildi (`out/montajchi_01_draft.mp4`, 44.5 s, subtitrsiz). KUTILMOQDA: uch bo'lakning to'g'rilangan matni (subtitr uchun), telekanal (yoshlar_tv) materiali uchun ruxsat/kredit, CTA uchun jonli ovoz (litsenziya), profil/telefon, uslublar va bo'laklar tasdig'i.
- **O'zbekcha ASR**: `scripts/asr_uz.py` (HF `navai-uz/whisper-medium-uzbek`, Apache-2.0; ~6x real vaqt CPU'da; so'z vaqtlari ISHONCHSIZ). Oddiy Whisper (small/large-v3) o'zbekchada yaroqsiz. Natija HAR DOIM odam tomonidan to'g'rilanadi.
- **Vaqtga moslash**: `scripts/align_uz.py <video> <matn.txt> <prefiks> [--rel]` — tasdiqlangan matnni CTC forced alignment bilan nutqqa moslaydi (model `MahmoudAshraf/mms-300m-1130-forced-aligner`, CC-BY-NC, ichki vosita; torchaudio rasmiy vaznlari tarmoqda yopiq). Aligner matn to'g'riligini tekshirmaydi.
- Kelajak: har buyurtmaning to'g'rilangan matni + audiosini `data/asr_tuzatishlar/` ga saqlash (fine-tuning uchun) — foydalanuvchiga taklif qilindi, javob kutilmoqda. Brifga "mijoz matni" bandini qo'shish tavsiya.
- **zarafshonda.ish e'loni** (`projects/zarafshonda-ish-2026-10-16/`): `src/Ish.tsx` (comp `Ish`), `scripts/build_ish.py`, `specs/01.json`; matn foydalanuvchidan, moslash `voice/al.json`. Draft yuborildi: `out/ish_01_draft.mp4` (15.2 s, -15.0 LUFS). Uslub: so'zma-so'z karaoke subtitr, punch-zoom, kalit kartochkalar, telefon +998 94 229 03 29, oxirgi karta. Musiqa CC0 HF 3:13. KUTILMOQDA: imlo ("povirga/dagovor" aynan qoldi), kanal nomi, "Bog'laning" aloqa, oxirgi kartadagi qo'shilgan matn tasdig'i; keyin `--scale 1`.
- Musiqa treklari /tmp/music/raw da vaqtinchalik (3:13 electropop, 4:13 techno qo'shildi).
- Yuksalish navbat o'zgarmadi: #10, #12, #08, #02, #07, #11, #04, #09, #05.

### 2026-10-16 — "AI adashdi" motion reklama (Zarafshon dasturchilari) YAKUNIY
- `projects/zarafshon-ai-adashdi-2026-10-16/`: `src/Adashdi.tsx` (comp `Adashdi`), `scripts/build_adashdi.py` (.venv; `--scale 1 --reuse-shots`), `specs/01.json`. Pixabay kadrlari (tabiat, mashina, taqinchoq, taom) -> 9:16 kesim -> effektlar (speed ramp, whip-pan, glitch, rewind/VHS, muhr, HUD), 120 BPM ritmga kesish, yangi SFX (scratch, rewind, glitch, riser, stamp).
- Ovoz: 5 ibora (OmniVoice, foydalanuvchi tasdiqlagan) `voice/lines/p*.wav`; musiqa ovoz ostida duck. Final: `out/adashdi_01_final.mp4` (1080x1920, 28 s, -14.0 LUFS, TP -1.5, QC toza). Instagram `@zarafshon_dasturchilari`, tel +998 93 316 97 13.
- Dars: Remotion'da absolute-joylashgan fon qatlami oddiy (static) bolalar ustidan chiqadi — matn bloki `position: 'relative'` bo'lsin (CTA matni xira chiqqan edi).
- Kutilmoqda: foydalanuvchi fikri (hazil, ritm, musiqa A/B). Musiqa fayllari /tmp/music/raw vaqtinchalik. Yuksalish #10 keyin boshlanadi.

### 2026-10-19 — Bolalar YouTube multfilmi (ingliz tili, pul ishlash) — konsept bosqichi
- Foydalanuvchi: YouTube, ingliz tilida, bolalar uchun o'rgatuvchi-qiziqarli; ssenariy hali yo'q, avval KADRLAR. `projects/kids-yt-2026-10-19/`, `templates/kinetic/src/Kids.tsx` (comp `Kids`, scene: bear|penguin|fox|lineup; qahramonlar Benny/Pip/Lila SVG, animatsiyaga tayyor), shrift Fredoka (OFL). Konsept PNG'lar `out/concept_*.png`.
- Higgsfield: 0 kredit (free plan) — AI rasm/video hozir ishlamaydi. Mahalliy AI video uchun GPU yo'q.
- Muhim cheklovlar (foydalanuvchiga aytilgan): YouTube "inauthentic/mass-produced" siyosati (2025–2026), "made for kids" (COPPA) reklama daromadini pasaytiradi; ovoz: OmniVoice CC-BY-NC monetizatsiyalangan kanalga YO'Q — ingliz tilida ruxsat etilgan TTS yoki jonli diktor kerak. Kutilmoqda: kadrlar bo'yicha fikr, ssenariy yo'nalishi, ovoz yo'li.

### 2026-10-19 — Kids test epizod (Benny, ranglar) tayyor
- `out/ep1_test.mp4` (1440x810, 49.1 s, -14.3 LUFS, QC toza). Komp `KidsEp` (`src/KidsEp.tsx`), builder `scripts/build_kids_ep.py <lines.json> <voice_dir> --scale 0.75` (scale 0.6667 TOQ o'lchamga olib keladi — ishlatma), ingliz TTS `scripts/tts_en.py` (language=en xotirada, config o'zgarmaydi) va `scripts/tts_en_pick.py` (ASR bilan eng tushunarli variantni tanlaydi). Satrlar `specs/ep1_lines.json`.
- Dars: "Ribbit" kabi onomatopeya TTS'da tushunarsiz (5 urinish) — oddiy jumla bilan almashtirildi; "red" takroriy so'z ba'zan "rit" bo'lib chiqadi — ASR tanlovi kerak. Whisper tekshiruvi nisbiy, inson eshitishi shart.
- Kutilmoqda: foydalanuvchi fikri. Keyingi yaxshilashlar: recap predmetlari kattaroq, Pip/Lila ham gapirsin (alohida ovoz), qo'shiq/ritm, 1920x1080 final.
