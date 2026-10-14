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
  dict(say="To‘g‘ri vositani to‘g‘ri vazifaga ishlatsangiz, vaqtni ikki-uch barobar tejaysiz.", sub="To‘g‘ri vositani to‘g‘ri vazifaga ishlatsangiz — vaqtni 2–3 barobar tejaysiz.", hl=["2–3", "barobar"], scene=dict(t="tools", step=3)),
  dict(say="Vositani tanlash ham skill.", sub="Vositani tanlash ham skill.", hl=["skill."], scene=dict(t="word", text="To‘g‘ri vosita\n= tez natija", accent="violet")),
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


# ================= v2: hook birinchi + haqiqiy fon kadrlari =================
def _b(f, ss): return ("pixabay_video_%s.mp4" % f, ss)

S.append(dict(id="02v2-prompt-yangi-til", title="Yaxshi prompt — yangi dasturlash tili (v2)", style="tech", bpm=104, key=57, lead=0.12, gap=0.2,
  cta="Eng yaxshi promptingizni\nizohlarda ulashing", cta_say="Eng yaxshi promptingizni izohlarda ulashing.", cta_bg=_b(200675, 1),
  segs=[
  dict(say="Prompt yozishni bilmasangiz, ey-ay sizga yordam bermaydi.", sub="Prompt yozishni bilmasangiz, AI sizga yordam bermaydi.", hl=["Prompt", "yordam"], bg=_b(200675, 1), scene=dict(t="kw", text="Yomon prompt\n= yomon kod", accent="red", hl=1)),
  dict(say="Ikki ming yigirma oltinchi yilda, eng muhim skill nima bilasizmi?", sub="2026-yilda eng muhim skill nima bilasizmi?", hl=["skill"], bg=_b(277096, 2), scene=dict(t="kw", text="Eng muhim\nskill?", accent="cyan")),
  dict(say="Yaxshi prompt yozish.", sub="Yaxshi prompt yozish.", hl=["prompt"], bg=_b(279625, 1), scene=dict(t="kw", text="Yaxshi prompt\nyozish", accent="green")),
  dict(say="Oddiy, login peyj yasab ber, deb yozsangiz, oddiy natija olasiz.", sub="Oddiy “login page yasab ber” deb yozsangiz — oddiy natija olasiz.", hl=["oddiy", "natija"], bg=_b(258439, 3), scene=dict(t="compare", step=1)),
  dict(say="Lekin, nekst jey es o‘n to‘rt, teylvind, dark mod, rispansiv, taypskript bilan login peyj yasab ber. Forma validatsiya ham bo‘lsin, deb yozsangiz.", sub="Lekin “Next.js 14, Tailwind, dark mode, responsive, TypeScript bilan login page yasab ber. Form validatsiya ham bo‘lsin” deb yozsangiz...", hl=["Next.js", "Tailwind,", "TypeScript"], bg=_b(258439, 6), scene=dict(t="compare", step=2)),
  dict(say="Natija butunlay boshqacha bo‘ladi.", sub="Natija butunlay boshqacha bo‘ladi.", hl=["boshqacha"], bg=_b(200675, 4), scene=dict(t="compare", step=3)),
  dict(say="Prompt, bu yangi dasturlash tili.", sub="Prompt — bu yangi dasturlash tili.", hl=["yangi", "dasturlash", "tili."], bg=_b(277096, 7), scene=dict(t="kw", text="Prompt =\nyangi til", accent="violet")),
]))

S.append(dict(id="03v2-7-kunda-portfolio", title="AI yordamida 7 kunda portfolio loyiha (v2)", style="progressive", bpm=110, key=62, lead=0.12, gap=0.18,
  cta="7 kunlik rejangizni boshlang.\nBirinchi qadamni izohlarda yozing", cta_say="Yetti kunlik rejangizni boshlang. Birinchi qadamni izohlarda yozing.", cta_bg=_b(31392, 3),
  segs=[
  dict(say="Portfolio yo‘q deb, ish topa olmayapsizmi?", sub="Portfolio yo‘q deb ish topa olmayapsizmi?", hl=["Portfolio"], bg=_b(3160, 1), scene=dict(t="kw", text="Portfolio\nyo‘qmi?", accent="red", hl=1)),
  dict(say="Ey-ay yordamida, yetti kunda haqiqiy loyiha yasash mumkin.", sub="AI yordamida 7 kunda haqiqiy loyiha yasash mumkin.", hl=["7", "kunda"], bg=_b(277096, 5), scene=dict(t="kw", text="7 kunda\nhaqiqiy loyiha", accent="cyan")),
  dict(say="Birinchi kun: g‘oya va dizayn.", sub="1-kun: G‘oya va dizayn", hl=["G‘oya"], bg=_b(149986, 0), scene=dict(t="kw", text="1-kun\nG‘oya va dizayn", accent="cyan", hl=0, sizes=[1.0, 0.55])),
  dict(say="Ikkinchidan to‘rtinchi kungacha: frontend.", sub="2–4 kun: Frontend (Cursor + Claude)", hl=["Frontend"], bg=_b(200675, 2), scene=dict(t="kw", text="2–4 kun\nFrontend", accent="green", hl=0, sizes=[1.0, 0.6])),
  dict(say="Beshinchi kun: bekend va baza.", sub="5-kun: Backend va baza", hl=["Backend"], bg=_b(258439, 4), scene=dict(t="kw", text="5-kun\nBackend va baza", accent="violet", hl=0, sizes=[1.0, 0.55])),
  dict(say="Oltinchi kun: diploy va tozalash.", sub="6-kun: Deploy va tozalash", hl=["Deploy"], bg=_b(279625, 3), scene=dict(t="kw", text="6-kun\nDeploy", accent="yellow", hl=0, sizes=[1.0, 0.6])),
  dict(say="Yettinchi kun: gitxab va layv demo.", sub="7-kun: GitHub + Live demo", hl=["GitHub", "Live"], bg=_b(149986, 6), scene=dict(t="kw", text="7-kun\nGitHub + Live demo", accent="green", hl=0, sizes=[1.0, 0.5])),
  dict(say="Lekin esda tuting: har bir qator kodni tushunib chiqing. Aks holda bu sizning loyihangiz emas.", sub="Lekin esda tuting: har bir qator kodni tushunib chiqing. Aks holda bu sizning loyihangiz emas.", hl=["tushunib", "emas."], bg=_b(200675, 6), scene=dict(t="kw", text="Tushunib\nyozing", accent="yellow")),
]))

S.append(dict(id="04v2-cursor-claude-chatgpt", title="Cursor, Claude yoki ChatGPT — qachon qaysi? (v2)", style="clean", bpm=108, key=60, lead=0.12, gap=0.18,
  cta="Siz qaysi AIʼni koʻproq ishlatasiz?\nIzohlarda yozing", cta_say="Siz qaysi ey-ay ni ko‘proq ishlatasiz? Izohlarda yozing.", cta_bg=_b(200675, 5),
  segs=[
  dict(say="Hamma ey-ay bir xil emas.", sub="Hamma AI bir xil emas.", hl=["emas."], bg=_b(277096, 0), scene=dict(t="kw", text="Hamma AI\nbir xil emas", accent="red", hl=1)),
  dict(say="Kursor, kod yozish va tahrirlash uchun eng qulay.", sub="Cursor — kod yozish va tahrirlash uchun eng qulay.", hl=["Cursor"], bg=_b(200675, 3), scene=dict(t="tool", idx=0)),
  dict(say="Klod, uzun va murakkab mantiqni tushunishda kuchli.", sub="Claude — uzun va murakkab mantiqni tushunishda kuchli.", hl=["Claude"], bg=_b(258439, 2), scene=dict(t="tool", idx=1)),
  dict(say="Chat jipiti, tez g‘oya va tushuntirish uchun yaxshi.", sub="ChatGPT — tez g‘oya va tushuntirish uchun yaxshi.", hl=["ChatGPT"], bg=_b(279625, 2), scene=dict(t="tool", idx=2)),
  dict(say="To‘g‘ri vositani to‘g‘ri vazifaga ishlatsangiz, vaqtni ikki-uch barobar tejaysiz.", sub="To‘g‘ri vositani to‘g‘ri vazifaga ishlatsangiz — vaqtni 2–3 barobar tejaysiz.", hl=["2–3", "barobar"], bg=_b(3160, 4), scene=dict(t="kw", text="Vaqtni 2–3\nbarobar tejang", accent="green")),
  dict(say="Vositani tanlash ham skill.", sub="Vositani tanlash ham skill.", hl=["skill."], bg=_b(277096, 8), scene=dict(t="kw", text="Vosita tanlash\n= skill", accent="violet")),
]))

S.append(dict(id="05v2-oziingizni-aldamang", title="AI ishlatayotganda oʻzingizni aldamaslik (v2)", style="ambient", bpm=72, key=55, lead=0.12, gap=0.22,
  cta="Kodni tushunib yozishga va’da bering.\nLike bosing", cta_say="Kodni tushunib yozishga va’da bering. Layk bosing.", cta_bg=_b(279625, 5),
  segs=[
  dict(say="Ey-ay yozgan kod, sizniki emas.", sub="AI yozgan kod — sizniki emas.", hl=["sizniki", "emas."], bg=_b(258439, 2), scene=dict(t="kw", text="AI yozgan kod\nsizniki emas", accent="red", hl=1)),
  dict(say="Agar kodni tushunmasangiz, bu sizning kodingiz emas.", sub="Agar kodni tushunmasangiz — bu sizning kodingiz emas.", hl=["tushunmasangiz"], bg=_b(200675, 4), scene=dict(t="kw", text="Kodni\ntushunasizmi?", accent="cyan")),
  dict(say="Ish beruvchi so‘raganda tushuntira olmasangiz, hamma narsa ochilib qoladi.", sub="Ish beruvchi so‘raganda tushuntira olmasangiz — hamma narsa ochilib qoladi.", hl=["tushuntira", "olmasangiz"], bg=_b(3160, 3), scene=dict(t="kw", text="Ish beruvchi\nso‘rasa?", accent="yellow")),
  dict(say="Ey-ay dan foydalaning.", sub="AI’dan foydalaning.", hl=["AI’dan"], bg=_b(277096, 8), scene=dict(t="kw", text="AI’dan\nfoydalaning", accent="cyan")),
  dict(say="Lekin har doim so‘rang: bu qanday ishlaydi?", sub="Lekin har doim so‘rang: “Bu qanday ishlaydi?”", hl=["“Bu", "qanday", "ishlaydi?”"], bg=_b(31392, 2), scene=dict(t="kw", text="Bu qanday\nishlaydi?", accent="yellow")),
  dict(say="Tushunmaguncha keyingi qadamga o‘tmang.", sub="Tushunmaguncha keyingi qadamga o‘tmang.", hl=["Tushunmaguncha"], bg=_b(258439, 10), scene=dict(t="kw", text="Tushunmaguncha\no‘tmang", accent="red")),
  dict(say="Shunda siz haqiqiy dasturchi bo‘lasiz.", sub="Shunda siz haqiqiy dasturchi bo‘lasiz.", hl=["haqiqiy", "dasturchi"], bg=_b(200675, 0), scene=dict(t="kw", text="Haqiqiy\ndasturchi", accent="green")),
]))


# ================= Yangi ssenariylar (2026-10-14), ruletka-hook bilan =================
S.append(dict(id="N1-ai-ishsiz-qiladimi", title="AI meni ishsiz qiladimi?", style="tech", bpm=100, key=57, gap=0.2,
  intro=dict(seed=7, say="Ey-ay keldi. Endi dasturchilar kerak emasmi?",
             card=[{"t": "AI keldi.", "size": 170, "color": "#0f172a"}, {"t": "Endi dasturchilar", "size": 112, "color": "#0f172a"}, {"t": "kerak emasmi?", "size": 128, "color": "#e11d48"}]),
  cta="Sizchi, AI’dan qo‘rqasizmi\nyoki foydalanasizmi?", cta_say="Sizchi, ey-ay dan qo‘rqasizmi yoki foydalanasizmi?", cta_bg=_b(200675, 6),
  segs=[
  dict(say="Yo‘q.", sub="Yo‘q.", hl=["Yo‘q."], bg=_b(258439, 2), scene=dict(t="kw", text="Yo‘q.", accent="red")),
  dict(say="Ey-ay oddiy ishlarni osonlashtirdi.", sub="AI oddiy ishlarni osonlashtirdi.", hl=["oddiy", "osonlashtirdi."], bg=_b(3160, 2), scene=dict(t="kw", text="Oddiy ishlar\nosonlashdi", accent="cyan")),
  dict(say="Lekin murakkab muammolarni yechish, tizim qurish...", sub="Lekin murakkab muammolarni yechish, tizim qurish...", hl=["murakkab", "tizim"], bg=_b(200675, 3), scene=dict(t="kw", text="Murakkab\nmuammolar", accent="yellow")),
  dict(say="va mas’uliyat olish hali ham odamga bog‘liq.", sub="va mas’uliyat olish hali ham odamga bog‘liq.", hl=["mas’uliyat", "odamga"], bg=_b(3160, 6), scene=dict(t="kw", text="Mas’uliyat —\nodamda", accent="yellow", hl=1)),
  dict(say="Ey-ay, tez va sifatli ishlash uchun vosita.", sub="AI — tez va sifatli ishlash uchun vosita.", hl=["vosita."], bg=_b(277096, 5), scene=dict(t="kw", text="AI = vosita", accent="green")),
  dict(say="Uni ushlagan odam esa hali ham kerak.", sub="Uni ushlagan odam esa hali ham kerak.", hl=["odam", "kerak."], bg=_b(279625, 3), scene=dict(t="kw", text="Odam hali\nham kerak", accent="cyan", hl=1)),
]))


def _own(f, ss=0): return (f, ss)
NONE = dict(t="none")
CARDC = lambda L: [{"t": t, "size": z, "color": c} for t, z, c in L]
INK, RED = "#0f172a", "#e11d48"

S.append(dict(id="N2-bir-kunda-pul", title="AI bilan bir kunda pul topish mumkinmi?", style="progressive", bpm=106, key=60, gap=0.2,
  intro=dict(kind="calendar", n_pages=1, say="Ey-ay yordamida bir kunda pul topish mumkinmi?",
             card=CARDC([("Bir kunda", 150, INK), ("AI bilan pul", 130, INK), ("topish", 130, INK), ("mumkinmi?", 150, RED)])),
  cta="Siz AI bilan qanday\nish qilyapsiz?", cta_say="Siz ey-ay bilan qanday ish qilyapsiz?", cta_bg=_b(3019, 5),
  segs=[
  dict(say="Ko‘p odam aytadi: ey-ay bilan tezda pul topish mumkin.", sub="Ko‘p odam aytadi: AI bilan tezda pul topish mumkin.", hl=["tezda", "pul"], bg=_b(59139, 1), scene=dict(t="kw", text="“Tez pul”", accent="yellow")),
  dict(say="Rostmi?", sub="Rostmi?", hl=["Rostmi?"], bg=_b(3019, 2), scene=dict(t="kw", text="Rostmi?", accent="red")),
  dict(say="Kichik frilans vazifalarni ey-ay yordamida tezroq bajarish mumkin.", sub="Kichik frilans vazifalarni AI yordamida tezroq bajarish mumkin.", hl=["frilans", "tezroq"], bg=_own("own_chat.mp4", 3.0), braw=True, scene=NONE),
  dict(say="Lekin, bir kunda katta pul, degan gap, ko‘pincha reklama.", sub="Lekin “bir kunda katta pul” degan gap — ko‘pincha reklama.", hl=["ko‘pincha", "reklama."], bg=_b(90332, 3), scene=dict(t="kw", text="“Katta pul”\n= reklama", accent="red", hl=1)),
  dict(say="Haqiqiy natija: ey-ay vaqtni tejaydi.", sub="Haqiqiy natija: AI vaqtni tejaydi.", hl=["vaqtni", "tejaydi."], bg=_b(34499, 1), scene=dict(t="kw", text="AI vaqtni\ntejaydi", accent="green")),
  dict(say="Vaqtni tejagan odam esa ko‘proq ish qila oladi.", sub="Vaqtni tejagan odam esa ko‘proq ish qila oladi.", hl=["ko‘proq", "ish"], bg=_b(130331, 2), scene=dict(t="kw", text="Ko‘proq ish\nqilasiz", accent="green", hl=1)),
]))

S.append(dict(id="N3-kod-bilmasdan-ai", title="Kod yozishni bilmasam ham AI bilan ishlay olamanmi?", style="clean", bpm=98, key=62, gap=0.2,
  intro=dict(kind="traffic", say="Kod yozishni bilmasam ham, ey-ay bilan ishlay olamanmi?",
             card=CARDC([("Kod yozishni", 120, INK), ("bilmasam ham", 120, INK), ("AI bilan ishlay", 112, INK), ("olamanmi?", 140, RED)])),
  cta="Kod yozishni bilmasangiz ham\nAI ishlatasizmi?", cta_say="Kod yozishni bilmasangiz ham, ey-ay ishlatasizmi?", cta_bg=_b(30033, 4),
  segs=[
  dict(say="Kod yozishni bilmasangiz ham ey-ay dan foydalana olasiz.", sub="Kod yozishni bilmasangiz ham AI’dan foydalana olasiz.", hl=["foydalana", "olasiz."], bg=_b(122, 1), scene=dict(t="kw", text="Ha,\nmumkin", accent="green")),
  dict(say="Lekin bir shart bilan.", sub="Lekin bir shart bilan.", hl=["shart"], bg=_b(130331, 4), scene=dict(t="kw", text="Bitta shart", accent="yellow")),
  dict(say="Nima xohlayotganingizni aniq tushuntira olishingiz kerak.", sub="Nima xohlayotganingizni aniq tushuntira olishingiz kerak.", hl=["aniq", "tushuntira"], bg=_own("own_chat.mp4", 3.0), braw=True, scene=NONE),
  dict(say="Ey-ay sizning fikringizni o‘qimaydi.", sub="AI sizning fikringizni o‘qimaydi.", hl=["fikringizni", "o‘qimaydi."], bg=_b(88219, 3), scene=dict(t="kw", text="AI fikringizni\no‘qimaydi", accent="red", hl=1)),
  dict(say="U faqat siz yozgan narsani bajaradi.", sub="U faqat siz yozgan narsani bajaradi.", hl=["faqat", "bajaradi."], bg=_own("own_code.mp4", 4.5), braw=True, scene=NONE),
  dict(say="Shuning uchun eng muhim skill, aniq so‘rash.", sub="Shuning uchun eng muhim skill — aniq so‘rash.", hl=["skill", "aniq", "so‘rash."], bg=_b(30033, 3), scene=dict(t="kw", text="Aniq so‘rash\n= skill", accent="violet", hl=1)),
]))

S.append(dict(id="N4-uch-xato", title="Eng ko‘p qilinadigan 3 ta AI xatosi", style="tech", bpm=104, key=57, gap=0.2,
  intro=dict(kind="scale", say="Ko‘pchilik qiladigan uchta ey-ay xatosi.", blocks=[{"t": "XATO", "bg": "#dc2626", "fg": "#ffffff"}, {"t": "TO‘G‘RI", "bg": "#16a34a", "fg": "#ffffff"}],
             card=CARDC([("Ko‘pchilik", 130, INK), ("qiladigan", 130, INK), ("3 ta AI xatosi", 112, RED)])),
  cta="Qaysi xatoni\no‘zingizda ko‘ryapsiz?", cta_say="Qaysi xatoni o‘zingizda ko‘ryapsiz?", cta_bg=_b(200675, 3),
  segs=[
  dict(say="Birinchi xato: to‘liq loyiha yasab ber, deb yozish.", sub="Birinchi xato: “To‘liq loyiha yasab ber” deb yozish.", hl=["Birinchi", "xato:"], bg=_b(72712, 2), scene=dict(t="kw", text="1-xato\n“To‘liq loyiha”", accent="red", hl=0, sizes=[1.0, 0.5])),
  dict(say="Ikkinchi xato: chiqqan kodni umuman o‘qimaslik.", sub="Ikkinchi xato: chiqqan kodni umuman o‘qimaslik.", hl=["Ikkinchi", "xato:"], bg=_own("own_term_fail.mp4", 2.0), braw=True, scene=NONE),
  dict(say="Uchinchi xato: ey-ay ga haddan tashqari ishonib, o‘zi o‘ylashni to‘xtatish.", sub="Uchinchi xato: AI’ga haddan tashqari ishonib, o‘zi o‘ylashni to‘xtatish.", hl=["Uchinchi", "xato:"], bg=_b(88219, 6), scene=dict(t="kw", text="3-xato\nO‘ylamaslik", accent="red", hl=0, sizes=[1.0, 0.6])),
  dict(say="Ey-ay yordamchi.", sub="AI — yordamchi.", hl=["yordamchi."], bg=_b(277096, 4), scene=dict(t="kw", text="AI =\nyordamchi", accent="cyan")),
  dict(say="Lekin boshqaruv hali ham sizda qolishi kerak.", sub="Lekin boshqaruv hali ham sizda qolishi kerak.", hl=["boshqaruv", "sizda"], bg=_b(19459, 2), scene=dict(t="kw", text="Boshqaruv\nsizda", accent="green", hl=1)),
]))

S.append(dict(id="N5-yetti-kunda-ai", title="7 kunda AI bilan nima qilish mumkin?", style="ambient", bpm=84, key=55, gap=0.2,
  intro=dict(kind="calendar", n_pages=7, say="Yetti kunda ey-ay ni to‘liq o‘rganish mumkinmi?",
             card=CARDC([("7 kunda", 170, INK), ("AI’ni to‘liq", 130, INK), ("o‘rganish", 130, INK), ("mumkinmi?", 150, RED)])),
  cta="Siz AI’ni qancha vaqtdan\nberi o‘rganyapsiz?", cta_say="Siz ey-ay ni qancha vaqtdan beri o‘rganyapsiz?", cta_bg=_b(3019, 6),
  segs=[
  dict(say="Ko‘p odam aytadi: yetti kunda ey-ay ni o‘rganib bo‘ladi.", sub="Ko‘p odam aytadi: 7 kunda AI’ni o‘rganib bo‘ladi.", hl=["7", "kunda"], bg=_b(34499, 1), scene=dict(t="kw", text="“7 kunda\no‘rganasiz”", accent="yellow", hl=1)),
  dict(say="Haqiqat boshqacha.", sub="Haqiqat boshqacha.", hl=["boshqacha."], bg=_b(90332, 6), scene=dict(t="kw", text="Haqiqat\nboshqacha", accent="red", hl=1)),
  dict(say="Yetti kunda oddiy vazifalarni bajarishni,", sub="7 kunda oddiy vazifalarni bajarishni,", hl=["oddiy", "vazifalarni"], bg=_b(200675, 4), scene=dict(t="kw", text="7 kunda\nmumkin:", accent="green", hl=0)),
  dict(say="prompt yozishni va asosiy vositalarni ishlatishni o‘rganish mumkin.", sub="prompt yozishni va asosiy vositalarni ishlatishni o‘rganish mumkin.", hl=["prompt", "vositalarni"], bg=_own("own_chat.mp4", 3.0), braw=True, scene=NONE),
  dict(say="Lekin chuqur tushunish, murakkab loyihalar va tajriba,", sub="Lekin chuqur tushunish, murakkab loyihalar va tajriba...", hl=["chuqur", "tajriba"], bg=_b(3160, 3), scene=dict(t="kw", text="Chuqur\ntushunish", accent="yellow")),
  dict(say="bu oylar masalasi.", sub="bu oylar masalasi.", hl=["oylar"], bg=_b(30033, 3), scene=dict(t="kw", text="Oylar\nmasalasi", accent="red", hl=1)),
  dict(say="Tez boshlash mumkin.", sub="Tez boshlash mumkin.", hl=["Tez", "boshlash"], bg=_b(277096, 2), scene=dict(t="kw", text="Tez boshlash\nmumkin", accent="green")),
  dict(say="Lekin, hammasini o‘rgandim, deb o‘ylash xato.", sub="Lekin “hammasini o‘rgandim” deb o‘ylash xato.", hl=["xato."], bg=_b(3019, 6), scene=dict(t="kw", text="“Hammasini\no‘rgandim”?", accent="red", hl=1)),
]))

S.append(dict(id="N6-qorqishmi", title="Dasturchilar AI’dan qo‘rqishi kerakmi?", style="clean", bpm=92, key=60, gap=0.2,
  intro=dict(kind="scale", seed=7, say="Dasturchilar ey-ay dan qo‘rqishi kerakmi?", blocks=[{"t": "AI", "bg": "#2563eb", "fg": "#ffffff"}, {"t": "ODAM", "bg": "#facc15", "fg": "#111111"}],
             card=CARDC([("Dasturchilar", 120, INK), ("AI’dan qo‘rqishi", 112, INK), ("kerakmi?", 150, RED)])),
  cta="Siz qaysi tomondasiz?", cta_say="Siz qaysi tomondasiz?", cta_bg=_b(200675, 1),
  segs=[
  dict(say="Ba’zi dasturchilar ey-ay dan qo‘rqadi.", sub="Ba’zi dasturchilar AI’dan qo‘rqadi.", hl=["qo‘rqadi."], bg=_b(88219, 1), scene=dict(t="kw", text="Qo‘rqadi", accent="red")),
  dict(say="Ba’zilari esa uni e’tiborsiz qoldiradi.", sub="Ba’zilari esa uni e’tiborsiz qoldiradi.", hl=["e’tiborsiz"], bg=_b(130331, 3), scene=dict(t="kw", text="E’tiborsiz", accent="yellow")),
  dict(say="Ikkalasi ham xato.", sub="Ikkalasi ham xato.", hl=["xato."], bg=_b(19459, 0), scene=dict(t="kw", text="Ikkalasi\nham xato", accent="red", hl=1)),
  dict(say="Ey-ay ni inkor qilgan odam orqada qoladi.", sub="AI’ni inkor qilgan odam orqada qoladi.", hl=["inkor", "orqada"], bg=_b(90332, 4), scene=dict(t="kw", text="Inkor =\norqada qolish", accent="cyan", hl=1)),
  dict(say="Ey-ay ga haddan tashqari ishongan odam esa sayoz bo‘lib qoladi.", sub="AI’ga haddan tashqari ishongan odam esa sayoz bo‘lib qoladi.", hl=["ishongan", "sayoz"], bg=_b(30033, 6), scene=dict(t="kw", text="Ortiqcha ishonch\n= sayoz bilim", accent="yellow", hl=1)),
  dict(say="Eng to‘g‘ri yo‘l, ey-ay ni o‘rganib, uni o‘z foydangizga ishlatish.", sub="Eng to‘g‘ri yo‘l — AI’ni o‘rganib, uni o‘z foydangizga ishlatish.", hl=["o‘rganib,", "foydangizga"], bg=_b(200675, 2), scene=dict(t="kw", text="O‘rganing va\nfoydalaning", accent="green", hl=1)),
]))
