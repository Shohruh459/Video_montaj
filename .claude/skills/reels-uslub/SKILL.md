---
name: reels-uslub
description: Yuksalish (@yuksalish713) va shu turdagi qisqa 9:16 Reels uchun uslub tanlash va yig'ish qoidalari. Foydalanuvchi ssenariydan video yasash, uslub tanlash, yangi uslub qo'shish yoki bir videoda bir necha uslubni aralashtirish haqida gapirganda ishlat.
---

# Reels uslub qoidasi (foydalanuvchi tasdiqlagan)

**Uslub har bir videoga qarab tanlanadi.** Bir uslub hamma videoga majburan qo'yilmaydi.

## 1. Tanlash
1. Ssenariyni o'qi: mavzu, his-tuyg'u, tuzilma (hook → fakt/qoida → CTA).
2. 9 ta tayyor uslub (`templates/kinetic/STYLES.md`) ichidan mosini tanla. Boshlang'ich yo'nalish (qat'iy emas):
   - hissiy, kinematografik → `kino-oltin`, `shisha`
   - qoida/usul/qadam → `terminal`, `split-oyna`
   - maslahat/reja/odat → `daftar`, `jurnal`, `minimal-oq`
   - kuchli hook, energik → `afisha`, `neon`
3. Tanlovni sababi bilan foydalanuvchiga qisqa ayt (1-2 gap), tasdiq ol yoki namuna ko'rsat.

## 2. Bir videoda bir necha uslub — ruxsat
- Har bir iboraga `"style": "<nom>"` berish mumkin (`src/Sample.tsx`, ketma-ket bir xil uslublar bitta segment bo'ladi, orasida 6 kadrlik crossfade).
- Faqat mazmun chegarasida almashtir: hook → asosiy qism → CTA. **Bir videoda 2–3 uslubdan ko'p emas**, segment ≥ ~3 soniya (tez-tez almashish tartibsiz ko'rinadi).
- Umumiy ranglar/shrift bir-biriga zid bo'lmasin (qorong'i ↔ och uslublarni aralashtirma, masalan `minimal-oq` bilan `neon`).
- Aralash videoning har bir o'tishini kadr bilan tekshir (qora kadr/sakrash yo'qligini).

## 3. Mavzuga tayyor uslub mos kelmasa — yangisini yasab sina
1. Yangi uslub nomini o'zbekcha, kebab-case qilib ber (masalan `tong-nuri`).
2. `src/Sample.tsx` ga komponent yoz, `STYLES` ro'yxatiga va `StyleView` ga ula.
3. **12–15 soniyalik namuna** (haqiqiy ovoz bilan) render qil, kadrlarni ko'zdan kechir (matn xavfsiz zonada, eng uzun so'z sig'adi), foydalanuvchiga ko'rsat.
4. Ma'qullansa: `STYLES.md` va `HANDOFF.md` ni yangila, commit/push. Ma'qullanmasa — tuzat yoki o'chir. Tasdiqsiz yakuniy videoda ishlatma.

## 4. Yig'ish ketma-ketligi (har video uchun)
1. Matn → TTS uchun tozala (raqamlar so'z bilan), ovoz matni va ekran matnini ajrat. **Faktlarni tekshir** (hisob-kitob, da'volar) — shubha bo'lsa foydalanuvchiga ayt.
2. Ovoz: `python3 scripts/tts_vs.py` (profil `config/voice.json`, V4, seed 11; filtr A avtomatik). Backend: `bash scripts/start_voice.sh`. Har qator alohida generatsiya, vaqtlar `ffprobe` dan.
3. B-roll: `python3 scripts/fetch_broll.py` (`--quality large` yakuniy uchun); har bir klipni kadr bilan tekshir; `CREDITS.md` to'ldir.
4. `src/data/<video>.json`: iboralar, vaqtlar, `a:true` urg'ular (**indekslarni so'zlar ro'yxatiga qarab tekshir**), `clip`, `style`.
5. Draft: `bash templates/kinetic/render.sh <uslub> out.mp4 0.5 <json>` → kadrlarni ko'r (boshi, o'rtasi, oxiri, har bir o'tish).
6. Foydalanuvchi ma'qullagach: `scale=1` yakuniy, `scripts/qc.sh` (−14 LUFS, yuv420p, qora kadr yo'q).

## 5. Qat'iy qoidalar
- Matn yon tomondan ≥ 8%, yuqori/pastdan ≥ 10% xavfsiz zona; eng uzun so'zga moslashgan shrift.
- `oʻ`, `gʻ` to'g'ri chiqishini ko'z bilan tekshir.
- Ovoz (OmniVoice) litsenziyasi **CC-BY-NC — faqat demo**; tijoriy yakuniy ish uchun foydalanuvchi bilan ovoz yo'lini kelish.
- Tekshirmagan narsani "tayyor" dema; ovozni men eshitib baholay olmayman — buni ochiq ayt.
