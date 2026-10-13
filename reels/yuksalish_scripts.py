# Yuksalish (@yuksalish713) — 30 ta Reels ssenariysi. Asl matn foydalanuvchidan; imlo to'g'rilashlar izohlangan.
# Qatorlar: jumla birliklari (har biri bitta ovoz qatori + bitta sahna). *so'z* — ekranda muhim so'z (boshqa rang/kattaroq).
# Apostrof ASCII (') bilan yoziladi: ekranda oʻ/gʻ (U+02BB), tutuq belgisi ʼ (U+02BC) ga aylantiriladi; TTS uchun ASCII.
CTA = {
    "obuna": ("Yuksalishga obuna bo'l.", "Yuksalishga obuna bo'l"),
    "saqla": ("Bu gapni saqlab qo'y.", "Bu gapni saqlab qo'y"),
    "ulash": ("Kimga kerak, ulash.", "Kimga kerak — ulash"),
    "kuzat": ("Harakat qilayotganlarni kuzat.", "Harakat qilayotganlarni kuzat"),
}
SCRIPTS = [
 (1, "harakat-qilmagan-odam", 24.5, "obuna", [
   "Ko'p odam orzu qiladi.", "Lekin orzu qilish oson.", "*Harakat* qilish esa og'ir.",
   "Shuning uchun 100 kishidan 97 tasi joyida turib qoladi.",
   "Agar bugun ham biror narsa qilmasang — erta ham xuddi shunday bo'ladi.", "Yuksalish *harakatdan* boshlanadi."]),
 (2, "vaqt-haqida", 21, "saqla", [
   "Vaqtingni behuda o'tkazayotganingni bilasan.", "Lekin baribir telefonni qo'yolmayapsan.",
   "Har kuni 2 soat yo'qotish — 1 yilda *730* *soat*.", "Bu degani — 30 kunlik hayot.",
   "Vaqtingni qaytarib ol.", "Yoki uni yo'qotishda davom et."]),
 (3, "ozingni-aldamaslik", 24, "obuna", [
   "Eng katta yolg'on — o'zingga aytgan *yolg'oning*.", "«Ertaga boshlayman», «Hozir vaqtim yo'q», «Keyinroq qilaman».",
   "Bu gaplar seni yildan-yilga orqaga suradi.", "*Bugun* boshla.", "Hatto kichik bo'lsa ham."]),
 (4, "yolgizlik", 26.5, "ulash", [
   "Yolg'iz qolishdan qo'rqma.", "Ba'zida eng katta o'sish *yolg'izlikda* bo'ladi.",
   "Odamlar seni tushunmasa ham, yo'lingdan qaytma.", "Chunki haqiqiy yuksalish ko'pchilik bilan emas, o'zing bilan boshlanadi."]),
 (5, "intizom", 22, "obuna", [
   "Motivatsiya keladi va ketadi.", "*Intizom* esa qoladi.", "Agar faqat kayfiyatga qarab ishlasang — hech qachon uzoqqa bormaysan.",
   "Kayfiyating yo'qligida ham ishni bajar.", "Shu payt haqiqiy kuch paydo bo'ladi."]),
 (6, "ertalab-turish", 22, "saqla", [
   "*Ertalab* turish qiyin.", "Lekin uy ichida yotib qolish undan ham qiyinroq natija beradi.",   # asl: "uyni ichida ... undanda"
   "Kim ertalab turib, birinchi soatini o'ziga bag'ishlasa — u kunni o'zi boshqaradi.", "Kim kech tursa — kun uni boshqaradi."]),
 (7, "kichik-qadamlar", 20, "obuna", [
   "Katta o'zgarish katta harakatdan emas, kichik qadamlardan boshlanadi.", "Har kuni *1* *foiz* yaxshilanish — 1 yilda 37 baravar o'sish.",
   "Shoshilma.", "Lekin to'xtama."]),
 (8, "odamlarning-fikri", 24, "ulash", [
   "Odamlar nima deydi deb yashashni to'xtat.", "Ular seni tushunmasa ham, ma'qullamasa ham — yo'lingni davom ettir.",
   "Chunki oxir-oqibat ularning fikri emas, sening *natijang* qoladi."]),
 (9, "dangasalik", 23, "obuna", [
   "*Dangasalik* — eng yashirin dushman.", "U seni urmaydi.", "U seni sekin-asta orzuingdan uzoqlashtiradi.",
   "Har kuni biroz harakat qil.", "Yoki har kuni biroz orqaga ket."]),
 (10, "ozingga-sodiq-bolish", 25, "saqla", [
   "Eng muhim va'da — *o'zingga* bergan va'da.", "Boshqalarga bergan va'dani bajarish osonroq.",
   "O'zingga berganini buzish esa eng oson.", "Shuning uchun o'zingga sodiq bo'l."]),
 (11, "muvaffaqiyatning-haqiqiy-yuzi", 26, "obuna", [
   "Muvaffaqiyat chiroyli ko'rinadi.", "Lekin uning orqasida ko'p yolg'izlik, ko'p rad etilish, ko'p tushkunlik bor.",
   "Kim buni ko'tara olsa — o'sha *yetib* boradi.", "Kim faqat natijani kutsa — yo'lda qoladi."]),
 (12, "bugun", 19, "kuzat", [
   "Ertaga degan gap eng ko'p aytiladigan yolg'on.", "*Bugun* qilmagan ishing ertalab ham qilinmaydi.",
   "Shuning uchun hozir boshla.", "Hatto charchagan bo'lsang ham."]),
 (13, "atrofingdagi-odamlar", 24, "obuna", [
   "Atrofingdagi *5* ta odam seni qanday bo'lishingni belgilaydi.", "Agar ular o'smasa — sen ham o'smaysan.",
   "Kim bilan vaqt o'tkazayotganingni qayta ko'rib chiq.", "Bu muhim."]),
 (14, "qorquv", 22, "saqla", [
   "Qo'rquv hech qachon yo'qolmaydi.", "Uni kutib o'tirma.", "Qo'rqib turganingda ham qadam tashla.",
   "Chunki *jasorat* — qo'rquvsizlik emas.", "Qo'rqib turib ham harakat qilish."]),
 (15, "odatlar", 23, "obuna", [
   "Hayotingni o'zgartirmoqchi bo'lsang — katta maqsad qo'yma.", "Kichik *odatni* o'zgartir.",
   "Ertalab 10 daqiqa o'qish, kechqurun telefonni ertaroq qo'yish,", "har kuni 20 daqiqa yurish.",   # asl: "ertalabroq" (kechqurun bilan zid) -> "ertaroq"
   "Kichik odatlar katta hayotni quradi."]),
 (16, "solishtirish", 21, "ulash", [
   "O'zingni boshqalar bilan solishtirishni to'xtat.", "Ularning yo'li — ularniki.", "Sening yo'ling — seniki.",
   "Faqat *kechagi* o'zing bilan solishtir.", "Shunda haqiqiy o'sishni ko'rasan."]),
 (17, "charchoq", 24, "obuna", [
   "Ba'zida charchaganini his qilasan.", "Lekin bu charchoq emas.", "Bu — *yo'nalishsizlik*.",
   "Qachonki nima uchun harakat qilayotganingni bilsang —", "charchoq ham yengil tuyuladi."]),
 (18, "kutish", 20, "saqla", [
   "Yaxshi kunlarni kutma.", "Yaxshi kunlarni *o'zing* yarat.", "Kutib o'tirgan odam umrining katta qismini kutish bilan o'tkazadi.",
   "Harakat qilgan odam esa natijani ko'radi."]),
 (19, "ichki-ovoz", 25, "obuna", [
   "Ichingdagi ovoz ba'zida seni to'xtatmoqchi bo'ladi.", "«Qila olmaysan», «Kech bo'ldi», «Boshqalar yaxshiroq».",
   "Bu ovozga *quloq* solma.", "U seni himoya qilmoqchi, lekin aslida seni cheklaydi."]),
 (20, "bir-yil", 22, "kuzat", [
   "Bir yil o'tadi.", "Sen yoki orzuingga yaqinroq bo'lasan, yoki xuddi shu joyda qolasan.", "*Tanlov* faqat sening qo'lingda.",
   "Hozir nima qilayotganing bir yildan keyingi holatingni belgilaydi."]),
 (21, "tashqi-va-ichki", 23, "obuna", [
   "Chiroyli kiyinish oson.", "Lekin ichingni tartibga solish undan ham muhimroq.",   # asl: "undanda"
   "Tashqi ko'rinish odamlarni jalb qiladi.", "*Ichki* holat esa seni ushlab turadi."]),
 (22, "hali-kech-emas", 21, "saqla", [
   "«Kech bo'ldi» degan gap eng katta yolg'onlardan biri.", "Hali kech emas.", "Hech qachon kech emas.",
   "Boshlashning eng yaxshi vaqti — kechagi kun edi.", "Ikkinchi eng yaxshi vaqti — *hozir*."]),
 (23, "fokus", 24, "obuna", [
   "Bir vaqtning o'zida hamma narsani qilmoqchi bo'lma.", "*Fokus* yo'qolsa — natija ham yo'qoladi.",
   "Bitta narsani tanla.", "Uni chuqur qil.", "Keyin keyingisiga o't."]),
 (24, "ozgarish-ogriqli", 25, "ulash", [
   "O'zgarish hech qachon qulay bo'lmaydi.", "U noqulay, og'riqli va qo'rqinchli.", "Lekin o'zgarmaslik undan ham og'riqliroq.",
   "Chunki o'zgarmaslik seni sekin-asta o'ldiradi.", "O'zgarish esa *tiriltiradi*."]),
 (25, "omad", 22, "obuna", [
   "Omad deganda ko'pchilik tasodifni tushunadi.", "Lekin haqiqiy omad — tayyorgarlikning imkoniyat bilan uchrashgan joyi.",
   "*Tayyor* bo'l.", "Imkoniyat o'zi keladi."]),
 (26, "yolgiz-ishlash", 23, "saqla", [
   "Ba'zida *yolg'iz* ishlash kerak bo'ladi.", "Hech kim tushunmasa ham, hech kim ma'qullamasa ham.",
   "Chunki ba'zi yo'llar faqat yolg'iz bosib o'tiladi.", "Va shu yo'llar eng katta natijani beradi."]),
 (27, "sabrsizlik", 21, "obuna", [
   "Sabrsizlik ko'p odamni yo'ldan to'xtatadi.", "Natija darhol ko'rinmasa — tashlab ketishadi.",
   "Lekin haqiqiy o'sish sekin va chuqur bo'ladi.", "*Sabrlilarni* kutadi."]),
 (28, "ozingni-sevish", 24, "ulash", [
   "O'zingni sevish egoizm emas.", "Bu — o'zingga *hurmat*.", "O'zingni hurmat qilmagan odam boshqalardan ham hurmat kutolmaydi.",
   "Avval o'zing bilan yarash."]),
 (29, "har-kuni", 20, "obuna", [
   "Katta ishlar katta kunlarda qilinmaydi.", "Ular oddiy kunlarda, hech kim ko'rmayotgan paytda, sekin-asta qilinadi.",
   "Har kunning *kichik* harakati katta natijani tug'diradi."]),
 (30, "yakuniy-eslatma", 26, "obuna", [
   "Sen hozir o'z hayotingning eng muhim *sahifasidasan*.", "Bu sahifani qanday yozishing faqat senga bog'liq.",
   "Yozishni to'xtatma.", "Harakatni to'xtatma.", "Yuksalishni to'xtatma."]),
]
