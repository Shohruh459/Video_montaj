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

## Yangilanish (2026-10-10, Remotion sinovi)
- Montaj instrumenti: ffmpeg+drawtext draft (`projects/byd-2026-10-10/build_draft.py`, 7 s) **va** Remotion (`templates/remotion`, `node templates/remotion/render.mjs <scenes.json> <out.mp4> [scale] [crf]`, 540x960 draft ≈ 2 daq 7 s). Ikkalasi ishlaydi.
- Remotion: o'rnatilgan `remotion@4.0.250`. Chromium'ning yangi versiyasi old-headless'ni qo'llamaydi → `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` ishlatiladi (`render.mjs` da, `CHROMIUM_PATH` bilan almashtiriladi). `node_modules` gitga kirmaydi.
- Remotion chiqishi `yuvj420p` (full range) → yakuniy eksportda `scripts/export.sh` bilan `yuv420p`ga qayta kodlash kerak. Hali sinalmagan.
- Pixabay: `fetch_broll.py` 403 berardi (User-Agent yo'q) — tuzatilgan.
- Kadrlar: Song Plus'ga mos zamonaviy SUV/salon yo'q. 4053 (eski Mercedes salon) — zaif, almashtirish kerak. 199 ochilish — eski SUV. Yaroqli: 340897, 200682, 19627.
- Ovoz: Microsoft TTS ulanmaydi (DNS). Foydalanuvchi "keyin kelishamiz" dedi. Ovoz/musiqa hali yo'q.
- Keyingi: yaxshiroq salon/ochilish kadrlari yoki rasmiy material → v3; ovoz kelishilgach audio + ducking → export → qc.

## Yangilanish (2026-10-10, TTS qidiruvi) — YANGI SESSIYADA BIRINCHI SHUNI QIL
**Holat:** ovoz hali yo'q. Montaj tomoni tayyor (draft v1 ffmpeg, v2 Remotion; `STUDIO.md`).

**Tarmoq (muhit sozlamalari, foydalanuvchi tahrirlaydi):**
- Ochiq: `huggingface.co`, `download.pytorch.org`, pypi, npm, `raw.githubusercontent.com`.
- Yopiq edi: `speech.platform.bing.com` (edge-tts), `api.elevenlabs.io`, `aisha.group`, **`us.aws.cdn.hf.co`** (HF katta fayllari → 403 "CONNECT tunnel failed").
- Foydalanuvchi `*.hf.co` qo'shganini aytdi, lekin shu sessiyada hali yopiq edi. **Yangi sessiyada birinchi tekshiruv:**
  `curl -sS -L -r 0-1023 -o /dev/null https://huggingface.co/k2-fsa/OmniVoice/resolve/main/model.safetensors` → 200/206 bo'lishi kerak. `speech.platform.bing.com` ham tekshir (edge-tts).

**TTS variantlari (tekshirilgan faktlar):**
- **Piper:** rasmiy `rhasspy/piper-voices` da `uz` yo'q → o'zbekcha Piper modeli YO'Q. (`piper-tts` PyPI'dan o'rnatiladi, lekin foydasiz.)
- **VoiceStudio** (`github.com/debpalash/voicestudio`, AGPL-3.0, haqiqiy, faol; klon: `/home/user/debpalash/voicestudio` — sessiyada yo'qolishi mumkin, `git clone --depth 1` bilan qayta ol, `GIT_LFS_SKIP_SMUDGE=1`): dvigatel k2-fsa OmniVoice, til ro'yxatida `uz` bor (115 soat). OpenAI-mos API `http://localhost:3900/v1/audio/speech`, MCP, `skills/voicestudio/SKILL.md`. Interfeyssiz o'rnatish: `bun run setup:api` (uv sync, CPU torch ~5 GB) so'ng `bun run dev:api`. Model `k2-fsa/OmniVoice` 2.45 GB (+ audio_tokenizer). **Sifat eshitilmagan; model og'irliklari litsenziyasi (OmniVoice/Qwen3-0.6B) aniqlanmagan — mijoz ishidan oldin tekshir.** O'rnatishdan oldin foydalanuvchiga hajm/litsenziyani ayt (loyiha qoidasi).
- **Navoiy TTS** (`aisha-org/navoiy-tts`, Apache-2.0, CosyVoice2 asosida): ~5 GB + CosyVoice runtime; GPU'siz sekin. Demo wav'lar HF'da (`demo/`), CDN ochilgach eshittirib ko'r.
- **edge-tts (Madina/Sardor):** eng oson, `scripts/tts_uz.py` tayyor; faqat `speech.platform.bing.com` ochilsa ishlaydi. Foydalanuvchi o'z kompyuterida ham olib berishi mumkin.
- Hamjamiyat HF modellari (`facebook/mms-tts-uzb-script_cyrillic` va b.) — sifat/litsenziya tekshirilmagan (MMS odatda NC).
- Eslatma: men audioni eshita olmayman — sifatni faqat foydalanuvchi baholaydi. Bepul xizmatlar (TTSMaker, Narakeet, Fish Audio) shartlarini (tijorat) foydalanuvchi o'zi tekshirsin.

**Keyingi qadamlar:**
1. Tarmoqni tekshir (yuqoridagi curl). Ochiq bo'lsa → VoiceStudio backend'ini o'rnat, `script.md` dagi matndan namuna ovoz (Madina kabi ayol) yarat, `voice/` ga qo'y, `SendUserFile` bilan yubor, foydalanuvchi eshitsin.
2. Edge-tts ochiq bo'lsa — Madina namunasi bilan solishtirish uchun yarat.
3. Ovoz tasdiqlangach: ovozni `build`ga ulash (ducking, musiqa −20 dB, −14 LUFS, `yuv420p`), Remotion yakuniy render (1080x1920), `export.sh` → `qc.sh`.
4. Parallel: salon/ochilish kadrlari (4053 va 199 zaif) — Pixabay'dan yangilarini qidir yoki rasmiy material so'ra.

## Yangilanish (2026-10-10, VoiceStudio o'rnatish urinishi)
- **HF CDN ochildi** (`huggingface.co/.../model.safetensors` Range → 206). Model yuklash mumkin.
- **`speech.platform.bing.com` hali yopiq** (edge-tts ishlamaydi).
- **VoiceStudio `bun run setup:api` (= `node scripts/setup-api.mjs`) PyTorch bosqichida yiqildi:** CPU torch wheel `https://download-r2.pytorch.org/whl/cpu/torch-2.8.0+cpu-cp311-...whl` — `download-r2.pytorch.org` yopiq (`tunnel error`). Qolgan 311 paket (spacy, gradio, scipy…) PyPI'dan yuklanishda muammosiz. `download.pytorch.org` ochiq, lekin wheel boshqa domenda.
- **Foydalanuvchi qo'shishi kerak (Allowed domains):** `download-r2.pytorch.org` (yoki `*.pytorch.org`) va `speech.platform.bing.com`. Sozlama faqat YANGI sessiyada ishlaydi.
- PyPI'dagi `torch` (Linux'da CUDA, bir necha GB) — tavsiya etilmaydi.
- **Yangi sessiyada qadamlar:**
  1. Tekshir: `curl -s -o /dev/null -w "%{http_code}" https://download-r2.pytorch.org/` va `https://speech.platform.bing.com/` (000 = yopiq).
  2. `/home/user/debpalash/voicestudio` yo'q bo'lsa: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/debpalash/voicestudio`. So'ng `OMNIVOICE_ANALYTICS_DISABLED=1 node scripts/setup-api.mjs` (fon rejimida, log faylga; ~5 GB).
  3. Backend: `bun run dev:api` (port 3900), `GET /health`, `GET /models`; model `k2-fsa/OmniVoice` (2.45 GB) o'rnatishdan oldin foydalanuvchiga hajm/litsenziyani ayt, rozilik ol (`POST /models/install`).
  4. `script.md` matnidan o'zbekcha ayol ovoz namunasi → `voice/` → `SendUserFile` → foydalanuvchi eshitadi.
  5. Bing ochiq bo'lsa: `python3 scripts/tts_uz.py` bilan Madina namunasini ham yarat, solishtirish uchun.

## Yangilanish (2026-10-10, kechroq) — VoiceStudio o'rnatildi
- `download-r2.pytorch.org` OCHILDI (404 = server javob beradi). `node scripts/setup-api.mjs` muvaffaqiyatli tugadi (`.venv` 2.4 GB, CPU torch). `bun scripts/dev-backend.mjs` ishga tushdi: `GET :3900/health` → `{"status":"ok","device":"cpu","version":"0.5.7"}`. MCP `/mcp` da. (Yuqoridagi "yopiq" yozuvlar eskirdi.)
- `speech.platform.bing.com` hali yopiq.
- **MODEL HALI YUKLANMAGAN** (`k2-fsa/OmniVoice`, 2.45 GB). **Litsenziya: model og'irliklari CC-BY-NC (tijoriy emas)**, audio_tokenizer — Boson Higgs Audio community license. Demo/sinov uchun mumkin; **mijoz (tijoriy) ishi uchun BO'LMAYDI** — yakuniy ishda jonli diktor/ruxsat etilgan ovoz kerak. Yuklashdan oldin foydalanuvchi roziligi shart (loyiha qoidasi) — so'ralgan, javob kutilmoqda.
- Keyingi: rozilik bo'lsa `POST /models/install {"repo_id":"k2-fsa/OmniVoice"}` → `GET /models/install/status` → `POST /v1/audio/speech` (til: uz) → `voice/` → foydalanuvchiga eshittir.

## Yangilanish (2026-10-10, asosiy ovoz)
- VoiceStudio o'rnatildi, model yuklandi (3.27 GB), ovoz namunalari yuborildi. Foydalanuvchi **2-raqamli ovozni asosiy** qildi: `female, middle-aged, low pitch` (`config/voice.json`). Asl 2-raqam seed'siz edi → ovozni qotirish uchun seed 7/42/1986 namunalari yuborildi; **foydalanuvchi qaysi seed'ni tanlashini kutamiz** (hozir vaqtincha 42). Tanlangach `config/voice.json` da `seed`ni yangila.
- Skript: `scripts/tts_vs.py` (qatorma-qator, pauza bilan). Hali to'liq 30 s matn bilan sinalmagan; to'liq matn avval 14 s chiqdi → `--speed 0.9`, `--pause 0.5–0.8` bilan 30 s ga yaqinlashtirish kerak.
- Backend fon jarayoni sessiyalar/turlar orasida to'xtaydi: `cd /home/user/debpalash/voicestudio && OMNIVOICE_ANALYTICS_DISABLED=1 setsid nohup bun scripts/dev-backend.mjs > log 2>&1 < /dev/null & disown`, so'ng `GET :3900/health` = ok.
- Litsenziya: CC-BY-NC → faqat demo.

## Yangilanish (2026-10-10, ovoz qotirildi)
- Foydalanuvchi **`vtest_2_ayol_past`** ni tanladi (seed'li variantlar emas). Asl fayl **ovoz namunasi (reference)** sifatida `config/voice_ref/asosiy_ayol_past.wav` (+ `.txt` transkript) ga saqlandi; `scripts/tts_vs.py` backendda `ASOSIY-ayol-past` profilini (clone) yo'q bo'lsa o'zi yaratadi. `config/voice.json` yangilandi. Yangi sessiyada faqat backendni ishga tushirish kifoya.
- Sinov: o'sha jumla va BYD matni shu profil bilan yaratildi (BYD: `--speed 0.9 --pause 0.9` → 19.1 s, −14.5 LUFS, peak −1.9). Foydalanuvchi eshitib baholashi kutilmoqda (namunaga o'xshashligi, talaffuz).
- 30 s ga yetish uchun: sekinroq tezlik (0.8) va/yoki uzunroq pauza; yoki matnni biroz uzaytirish (mijoz tasdig'i bilan). Pauzalar sahna kesishlariga mos bo'lsin.

## Yangilanish (2026-10-10, yig'ish skripti ishladi)
- **`scripts/make_video.py <loyiha> --draft|--final`** boshidan oxirigacha SINALDI (draft): ovoz (kesh `voice/cache/`) → sahna vaqtlari ovoz davomiyligidan → Remotion → audio mix → mux (yuv420p, aac 256k/48k). Natija: `out/byd-song-plus_draft.mp4`, 540x960, 29.58 s, −14.0 LUFS, peak −3.3, qora kadr yo'q. Remotion davomiyligi dinamik (`calculateMetadata`).
- **`--final` (1080x1920 + export.sh + qc.sh) HALI SINALMAGAN.** Remotion yakuniy render vaqti noma'lum (draft 0.5 scale ≈ 2 daq).
- **Musiqa** (`build.music`, ducking filtri yozilgan) HALI SINALMAGAN — musiqa fayli yo'q. **Subtitr** yo'q.
- `scripts/start_voice.sh` — backendni ishga tushiradi (sessiyalar orasida to'xtaydi).
- Kuzatuv: pauza yuqori chegaraga (2.4 s) yetdi (nutq 16.6 s) → bo'shliqlar uzun; matnni biroz uzaytirish yoki tezlikni 0.8 ga tushirish mumkin. Ovoz-kadr sinxronini eshitib tekshirmadim.
- Pexels: domenlar (`api.pexels.com`, `videos.pexels.com`, `images.pexels.com`) yopiq; kalit `PEXELS_API_KEY` yo'q. Foydalanuvchi qo'shgach `fetch_broll.py --source pexels` yoziladi.
- Kadrlar sifati o'zgarmadi: salon (4053, eski Mercedes) va ochilish (199) zaif.
