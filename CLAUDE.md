# Video Montaj — buyurtma asosida video ishlab chiqarish

Til: foydalanuvchi bilan **o'zbek tilida** (lotin yozuvi) gaplash. Kod, fayl nomlari va buyruqlar inglizcha qoladi.
Asosiy qoida: **sifatsiz ishni topshirmaymiz.** Shubha bo'lsa — to'xtab so'ra yoki namuna ko'rsat.

> **Yangi sessiya: avval `HANDOFF.md` ni o'qi** (loyiha holati, sinalganlar, keyingi qadamlar). Ish oxirida uni yangila.

## 1. Ish tartibi (har bir buyurtma uchun)
1. **Brif**: maqsad, auditoriya, davomiylik, format (9:16 / 16:9 / 1:1), platforma, uslub, ovoz (erkak/ayol), logotip/ranglar, muddat. Yetishmasa so'ra — taxmin qilma.
2. **Ssenariy + matn** `projects/<mijoz>-<sana>/script.md` ga yoz. Mijoz tasdiqlamaguncha render qilma.
3. **Namuna (draft)**: 480p/past sifat + 10–15 soniyali ovoz namunasi. Mijoz ma'qullagach — to'liq render.
4. **Yakuniy render** → `scripts/export.sh` → `scripts/qc.sh`. QC o'tmasa topshirma.
5. Topshirishda: fayl yo'li, davomiylik, o'lcham, nimalar qilingani, mijozdan so'ralishi kerak narsalar.

Papka: `projects/<mijoz>-<sana>/{raw,voice,broll,out}` (`projects/_template` dan nusxa ol). `raw/`, `out/` va media fayllar gitga **kirmaydi**.

## 2. Texnik standartlar (buzilmasin)
- Video: H.264 High, `yuv420p`, CRF 16–18, `-movflags +faststart`, 30 fps (yoki manba fps, **hech qachon aralash emas**).
- O'lcham: 1920×1080 (16:9), 1080×1920 (9:16 Reels/Shorts/TikTok), 1080×1350 (4:5). Kichik manbani kattalashtirib "xira" qilma — kerak bo'lsa upscale (Higgsfield `upscale_video`).
- Audio: AAC 256k, 48 kHz, **−14 LUFS, true peak ≤ −1 dB**. Fon musiqasi ovozdan **−18…−22 dB** pastda; ovoz paytida ducking.
- Subtitr: ekran chetidan 8–10% xavfsiz zona, 1–2 qator, bir qatorda ≤ 42 belgi, kontrast yetarli. O'zbekcha harflar (oʻ, gʻ, shʻ, tutuq belgisi) to'g'ri chiqishini **ko'z bilan tekshir** (shrift: Noto Sans / DejaVu).
- Montaj: kesish ritmga mos, 0.3 s dan qisqa "tasodifiy" kadr yo'q, qora kadr yo'q, ovozda klik/chiqish yo'q (har bir kesishda 10–30 ms fade).
- Mualliflik huquqi: faqat litsenziyali musiqa/rasm/shrift. Manbani `projects/<...>/CREDITS.md` ga yoz. Mijozning logotipini o'zgartirma.

## 3. O'zbekcha ovoz (eng muhim joy)
Tartib: **matnni tayyorla → ovoz tanla → namuna eshittir → tasdiq → to'liq.**
- Matnni TTS uchun **tozala**: raqamlar, sana, narx, qisqartma va chet so'zlarni **so'z bilan yoz** (`2500` → `ikki ming besh yuz`, `AI` → `ey-ay`). Gaplar qisqa (≤ 20 so'z). Urg'u/pauza uchun vergul va nuqta ishlat.
- Lotin imlosini **to'g'ri** yoz: `oʻ`, `gʻ`, `sh`, `ch`, `ng`. Kirill matn kelsa — lotinga o'gir va mijozdan so'ra.
- Variantlar (past → yuqori sifat/narx):
  1. `scripts/tts_uz.py` — Microsoft neyron ovozi (`uz-UZ-MadinaNeural`, `uz-UZ-SardorNeural`), bepul, draft va oddiy ishlar uchun yaxshi.
  2. Azure Speech yoki ElevenLabs (kalitni `.env` ga qo'y) — ko'proq nazorat (SSML, urg'u).
  3. Eng yuqori ishonch: **jonli diktor** yozuvi (reklama/ishonch talab qiladigan ishlar uchun tavsiya).
- Ovozni **mijozga eshittirmasdan** yakuniy qilma. Noto'g'ri talaffuz bo'lsa — so'zni fonetik yozib qayta ol (masalan, `Samarqand` → kerak bo'lsa `Samarqand` yoki tutuq bilan sinab ko'r).
- Boshqa shaxsning ovozini klonlash faqat **uning yozma roziligi** bilan.
- Qayta ishlash: `scripts/normalize_audio.sh`; shovqin bo'lsa `afftdn`, nafas/“s” ni `deesser` bilan yumshat.

## 4. AI video / motion (Higgsfield MCP)
- Avval `get_workflow_instructions` / `models_explore(action:'recommend')` chaqir, keyin `generate_*`.
- **Kredit sarflashdan oldin** narx va soni haqida foydalanuvchiga ayt; ruxsatsiz katta partiya (batch) ishga tushirma.
- AI kadrlarni har doim ko'zdan kechir: qo'l/barmoq, yuz, matn (yozuvlar), logotip buzilishi. Buzuq bo'lsa — qayta generatsiya, kesib tashlama usulida yashirma.
- AI klip 5–10 s bo'ladi: hikoyani shunga bo'l, kadrlarni bir xil uslub, rang va yorug'lik bilan ushlab tur (bir xil `seed`/reference rasm).
- Matnli grafika/logotipni AI'ga chizdirma — **ffmpeg/overlay bilan** o'zing qo'y (aniq chiqadi).
- Motion grafika (titrlar, lower-third, animatsiyali matn): ffmpeg `drawtext`/`overlay` yoki Remotion/After Effects shablon; murakkabi uchun Remotion o'rnat (`npm i remotion`), har bir shablon `templates/` da.
- Haqiqiy shaxs/mashhur kishi/brend yuzini mijoz roziligisiz yasama.

## 5. Server talablari
- Hozirgi muhit: 4 CPU, 15 GB RAM, **GPU yo'q**, ffmpeg 6.1 bor. Bunda: montaj, subtitr, eksport, TTS — ishlaydi; og'ir AI-generatsiya Higgsfield (bulut) orqali.
- Tavsiya: 8+ CPU, 16–32 GB RAM, 100+ GB SSD (xom video tez to'ladi). Mahalliy AI modellar kerak bo'lsa — NVIDIA GPU (≥ 16 GB VRAM).
- Birinchi marta: `bash scripts/setup.sh`.
- Sandbox/bulut sessiyada fayllar vaqtinchalik: tayyor ishni **darhol** mijozga/saqlash joyiga yubor, gitga faqat skript va shablonlarni commit qil.
- Kalitlar `.env` da; hech qachon commit qilma, chatga yozma.

## 6. Topshirishdan oldin tekshiruv (checklist)
- [ ] Brifdagi hamma talab bajarildi (davomiylik, format, logotip, kontakt, CTA)
- [ ] Matn va subtitrda xato yo'q (imlo, raqam, telefon, manzil, narx) — mijoz matniga solishtirildi
- [ ] Ovoz tiniq, talaffuz to'g'ri, −14 LUFS
- [ ] Kadr tashlanishi, qora kadr, sakrash, sinxron siljishi yo'q
- [ ] Boshidan oxirigacha **to'liq ko'rib/eshitib chiqildi** (skrinshotlar bilan: boshi, o'rtasi, oxiri)
- [ ] `scripts/qc.sh` natijasi toza
- [ ] Litsenziyalar `CREDITS.md` da

Eslatma: tekshirmagan narsani "tayyor" deb aytma. Muammo bo'lsa — ochiq ayt va yechim taklif qil.
