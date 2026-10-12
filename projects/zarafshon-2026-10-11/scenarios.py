# -*- coding: utf-8 -*-
"""5 ta Reels ssenariysi (mijoz matni: Zarafshon_Dasturchilari_AI_Ssenariylar.html).
say = TTS uchun fonetik matn (raqam/chet so'z so'z bilan), sub = ekranda ko'rinadigan matn (mijoz matni).
hl = rangda ajratiladigan so'zlar. scene = vizual."""
BRAND = "Zarafshon Dasturchilari"

S = []

S.append(dict(id="01-ai-ga-ishonmang", title="AIʼga toʻliq ishonib yubormang", style="lofi", bpm=76, key=57,
  cta="Siz ham shunday xato qilganmisiz?\nIzohlarda yozing", cta_say="Siz ham shunday xato qilganmisiz? Izohlarda yozing.",
  segs=[
  dict(say="Ko‘p dasturchi ey-ay ga, to‘liq loyiha yasab ber, deb yozadi.", sub="Ko‘p dasturchi AI’ga “to‘liq loyiha yasab ber” deb yozadi...", hl=["AI’ga"], scene=dict(t="chat", mode="bad", prompt="to‘liq loyiha yasab ber")),
  dict(say="Va natijadan norozi bo‘ladi.", sub="va natijadan norozi bo‘ladi.", hl=["norozi"], scene=dict(t="chat", mode="bad", prompt="to‘liq loyiha yasab ber", err=True, typed=True)),
  dict(say="Ey-ay, yordamchi. U sizning o‘rningizga o‘ylamaydi.", sub="AI — yordamchi. U sizning o‘rningizga o‘ylamaydi.", hl=["yordamchi."], scene=dict(t="word", text="AI — yordamchi", accent="cyan")),
  dict(say="To‘g‘ri yo‘l: kichik qismlarga bo‘lib so‘rang.", sub="To‘g‘ri yo‘l: kichik qismlarga bo‘lib so‘rang.", hl=["kichik", "qismlarga"], scene=dict(t="chat", mode="good", prompt="1-qadam: login formasi")),
  dict(say="Har bir qadamni o‘zingiz tushuning.", sub="Har bir qadamni o‘zingiz tushuning.", hl=["tushuning."], scene=dict(t="chat", mode="good", prompt="2-qadam: validatsiya", done=True)),
  dict(say="Aks holda siz dasturchi emas, shunchaki, prompt yozuvchi bo‘lib qolasiz.", sub="Aks holda siz dasturchi emas, shunchaki “prompt yozuvchi” bo‘lib qolasiz.", hl=["“prompt", "yozuvchi”"], scene=dict(t="word", text="prompt yozuvchi?", accent="yellow")),
]))

S.append(dict(id="02-prompt-yangi-til", title="Yaxshi prompt — yangi dasturlash tili", style="tech", bpm=96, key=57,
  cta="Eng yaxshi promptingizni\nizohlarda ulashing", cta_say="Eng yaxshi promptingizni izohlarda ulashing.",
  segs=[
  dict(say="Ikki ming yigirma oltinchi yilda, eng muhim skill nima bilasizmi?", sub="2026-yilda eng muhim skill nima bilasizmi?", hl=["skill"], scene=dict(t="word", text="Yaxshi prompt\n= yaxshi kod", accent="cyan")),
  dict(say="Yaxshi prompt yozish.", sub="Yaxshi prompt yozish.", hl=["prompt"], scene=dict(t="compare", step=0)),
  dict(say="Oddiy, login peyj yasab ber, deb yozsangiz, oddiy natija olasiz.", sub="Oddiy “login page yasab ber” deb yozsangiz — oddiy natija olasiz.", hl=["oddiy", "natija"], scene=dict(t="compare", step=1)),
  dict(say="Lekin, nekst jey es o‘n to‘rt, teylvind, dark mod, rispansiv, taypskript bilan login peyj yasab ber. Forma validatsiya ham bo‘lsin, deb yozsangiz.", sub="Lekin “Next.js 14, Tailwind, dark mode, responsive, TypeScript bilan login page yasab ber. Form validatsiya ham bo‘lsin” deb yozsangiz...", hl=["Next.js", "Tailwind,", "TypeScript"], scene=dict(t="compare", step=2)),
  dict(say="Natija butunlay boshqacha bo‘ladi.", sub="Natija butunlay boshqacha bo‘ladi.", hl=["boshqacha"], scene=dict(t="compare", step=3)),
  dict(say="Prompt, bu yangi dasturlash tili.", sub="Prompt — bu yangi dasturlash tili.", hl=["yangi", "dasturlash", "tili."], scene=dict(t="word", text="Prompt =\nyangi dasturlash tili", accent="violet")),
]))

S.append(dict(id="03-7-kunda-portfolio", title="AI yordamida 7 kunda portfolio loyiha", style="progressive", bpm=104, key=62,
  cta="7 kunlik rejangizni boshlang.\nBirinchi qadamni izohlarda yozing", cta_say="Yetti kunlik rejangizni boshlang. Birinchi qadamni izohlarda yozing.",
  segs=[
  dict(say="Portfolio yo‘q deb, ish topa olmayapsizmi?", sub="Portfolio yo‘q deb ish topa olmayapsizmi?", hl=["Portfolio"], scene=dict(t="word", text="7 kunda\nportfolio", accent="cyan")),
  dict(say="Ey-ay yordamida, yetti kunda haqiqiy loyiha yasash mumkin.", sub="AI yordamida 7 kunda haqiqiy loyiha yasash mumkin.", hl=["7", "kunda"], scene=dict(t="timeline", step=-1)),
  dict(say="Birinchi kun: g‘oya va dizayn.", sub="1-kun: G‘oya va dizayn", hl=["G‘oya"], scene=dict(t="timeline", step=0)),
  dict(say="Ikkinchidan to‘rtinchi kungacha: frontend.", sub="2–4 kun: Frontend (Cursor + Claude)", hl=["Frontend"], scene=dict(t="timeline", step=1)),
  dict(say="Beshinchi kun: bekend va baza.", sub="5-kun: Backend va baza", hl=["Backend"], scene=dict(t="timeline", step=2)),
  dict(say="Oltinchi kun: diploy va tozalash.", sub="6-kun: Deploy va tozalash", hl=["Deploy"], scene=dict(t="timeline", step=3)),
  dict(say="Yettinchi kun: gitxab va layv demo.", sub="7-kun: GitHub + Live demo", hl=["GitHub", "Live"], scene=dict(t="timeline", step=4)),
  dict(say="Lekin esda tuting: har bir qator kodni tushunib chiqing. Aks holda bu sizning loyihangiz emas.", sub="Lekin esda tuting: har bir qator kodni tushunib chiqing. Aks holda bu sizning loyihangiz emas.", hl=["tushunib", "emas."], scene=dict(t="warn", text="Tushunib yozing")),
]))

S.append(dict(id="04-cursor-claude-chatgpt", title="Cursor, Claude yoki ChatGPT — qachon qaysi?", style="clean", bpm=100, key=60,
  cta="Siz qaysi AIʼni koʻproq ishlatasiz?\nIzohlarda yozing", cta_say="Siz qaysi ey-ay ni ko‘proq ishlatasiz? Izohlarda yozing.",
  segs=[
  dict(say="Hamma ey-ay bir xil emas.", sub="Hamma AI bir xil emas.", hl=["emas."], scene=dict(t="tools", step=-1)),
  dict(say="Kursor, kod yozish va tahrirlash uchun eng qulay.", sub="Cursor — kod yozish va tahrirlash uchun eng qulay.", hl=["Cursor"], scene=dict(t="tools", step=0)),
  dict(say="Klod, uzun va murakkab mantiqni tushunishda kuchli.", sub="Claude — uzun va murakkab mantiqni tushunishda kuchli.", hl=["Claude"], scene=dict(t="tools", step=1)),
  dict(say="Chat jipiti, tez g‘oya va tushuntirish uchun yaxshi.", sub="ChatGPT — tez g‘oya va tushuntirish uchun yaxshi.", hl=["ChatGPT"], scene=dict(t="tools", step=2)),
  dict(say="To‘g‘ri asbobni to‘g‘ri vazifaga ishlatsangiz, vaqtni ikki-uch barobar tejaysiz.", sub="To‘g‘ri asbobni to‘g‘ri vazifaga ishlatsangiz — vaqtni 2–3 barobar tejaysiz.", hl=["2–3", "barobar"], scene=dict(t="tools", step=3)),
  dict(say="Asbobni tanlash ham skill.", sub="Asbobni tanlash ham skill.", hl=["skill."], scene=dict(t="word", text="To‘g‘ri asbob\n= tez natija", accent="violet")),
]))

S.append(dict(id="05-oziingizni-aldamang", title="AI ishlatayotganda oʻzingizni aldamaslik", style="ambient", bpm=68, key=55,
  cta="Kodni tushunib yozishga va’da bering.\nLike bosing", cta_say="Kodni tushunib yozishga va’da bering. Layk bosing.",
  segs=[
  dict(say="Eng xavfli narsa, ey-ay yordamida yozilgan kodni o‘zingizniki deb hisoblash.", sub="Eng xavfli narsa — AI yordamida yozilgan kodni o‘zingizniki deb hisoblash.", hl=["xavfli"], scene=dict(t="typing", text="Bu sizning\nkodingizmi?")),
  dict(say="Agar kodni tushunmasangiz, bu sizning kodingiz emas.", sub="Agar kodni tushunmasangiz — bu sizning kodingiz emas.", hl=["tushunmasangiz"], scene=dict(t="typing", text="Tushunasanmi?", q=True)),
  dict(say="Ish beruvchi so‘raganda tushuntira olmasangiz, hamma narsa ochilib qoladi.", sub="Ish beruvchi so‘raganda tushuntira olmasangiz — hamma narsa ochilib qoladi.", hl=["tushuntira", "olmasangiz"], scene=dict(t="typing", text="Tushuntira\nolasizmi?")),
  dict(say="Ey-ay dan foydalaning.", sub="AI’dan foydalaning.", hl=["AI’dan"], scene=dict(t="word", text="AI’dan\nfoydalaning", accent="cyan")),
  dict(say="Lekin har doim so‘rang: bu qanday ishlaydi?", sub="Lekin har doim so‘rang: “Bu qanday ishlaydi?”", hl=["“Bu", "qanday", "ishlaydi?”"], scene=dict(t="typing", text="Bu qanday\nishlaydi?", q=True)),
  dict(say="Tushunmaguncha keyingi qadamga o‘tmang.", sub="Tushunmaguncha keyingi qadamga o‘tmang.", hl=["Tushunmaguncha"], scene=dict(t="warn", text="Tushunmaguncha\no‘tma")),
  dict(say="Shunda siz haqiqiy dasturchi bo‘lasiz.", sub="Shunda siz haqiqiy dasturchi bo‘lasiz.", hl=["haqiqiy", "dasturchi"], scene=dict(t="check", text="Haqiqiy dasturchi")),
]))


# ---- v2: retention uchun qayta qurilgan 1-reel (Instagram: 3 soniyada 80% ketgan) ----
S.append(dict(id="01v2-ai-ga-ishonmang", title="AI sizni dasturchi qilmaydi (v2)", style="tech", bpm=100, key=57, lead=0.12, gap=0.2,
  cta="Siz ham shunday xato qilganmisiz?\nIzohlarda yozing", cta_say="Siz ham shunday xato qilganmisiz? Izohlarda yozing.", cta_bg=("pixabay_video_215500.mp4", 7),
  segs=[
  dict(say="Ey-ay sizni dasturchi qilmaydi.", sub="AI sizni dasturchi qilmaydi.", hl=["dasturchi", "qilmaydi."], bg=("pixabay_video_215500.mp4", 1), scene=dict(t="kw", text="AI sizni\ndasturchi\nqilmaydi", accent="yellow")),
  dict(say="Ko‘p dasturchi ey-ay ga, to‘liq loyiha yasab ber, deb yozadi.", sub="Ko‘p dasturchi AI’ga “to‘liq loyiha yasab ber” deb yozadi...", hl=["AI’ga"], bg=("pixabay_video_3188.mp4", 2), scene=dict(t="kw", text="“To‘liq loyiha\nyasab ber”", accent="cyan")),
  dict(say="Va natijadan norozi bo‘ladi.", sub="va natijadan norozi bo‘ladi.", hl=["norozi"], bg=("pixabay_video_32767.mp4", 5), scene=dict(t="kw", text="Natija:\nchalkash", accent="red")),
  dict(say="Ey-ay, yordamchi. U sizning o‘rningizga o‘ylamaydi.", sub="AI — yordamchi. U sizning o‘rningizga o‘ylamaydi.", hl=["yordamchi."], bg=("pixabay_video_183108.mp4", 3), scene=dict(t="kw", text="AI =\nyordamchi", accent="cyan")),
  dict(say="To‘g‘ri yo‘l: kichik qismlarga bo‘lib so‘rang.", sub="To‘g‘ri yo‘l: kichik qismlarga bo‘lib so‘rang.", hl=["kichik", "qismlarga"], bg=("pixabay_video_1625.mp4", 3), scene=dict(t="kw", text="Kichik\nqadamlar", accent="green")),
  dict(say="Har bir qadamni o‘zingiz tushuning.", sub="Har bir qadamni o‘zingiz tushuning.", hl=["tushuning."], bg=("pixabay_video_1625.mp4", 9), scene=dict(t="kw", text="Tushunib\nyozing", accent="green")),
  dict(say="Aks holda siz dasturchi emas, shunchaki, prompt yozuvchi bo‘lib qolasiz.", sub="Aks holda siz dasturchi emas, shunchaki “prompt yozuvchi” bo‘lib qolasiz.", hl=["“prompt", "yozuvchi”"], bg=("pixabay_video_168485.mp4", 3), scene=dict(t="kw", text="prompt\nyozuvchi?", accent="yellow")),
]))
