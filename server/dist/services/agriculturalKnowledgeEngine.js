"use strict";
/**
 * Comprehensive Agricultural Knowledge & Diagnostic Engine
 * Covers Philippine & tropical crops, pests, diseases, fertilizers, watering, weather, and organic remedies.
 * Supports Tagalog, Bisaya, and English queries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAgriculturalKnowledge = queryAgriculturalKnowledge;
function queryAgriculturalKnowledge(userQuery, context) {
    const q = userQuery.toLowerCase().trim();
    const cropHint = context?.cropName?.toLowerCase() || '';
    // Language detection
    const hasTagalogWords = /\b(ano|anong|bakit|paano|kailan|mabisa|pamatay|gamot|paraan|sugpuin|lunas|tanim|magtanim|dahon|palay|pataba|dilig|uod|lupa|bulaklak|bunga|paninilaw|naninilaw)\b/i.test(q);
    const hasBisayaWords = /\b(ngano|unsa|unsaon|kanus-a|palihog|dangan|yuta|tanom|kapayas|humay|bisbis)\b/i.test(q);
    const isBisaya = (hasBisayaWords || context?.preferredLanguage === 'Bisaya') && !hasTagalogWords;
    const isTagalog = hasTagalogWords || context?.preferredLanguage === 'Tagalog' || (!isBisaya && /^[a-z0-9\s.,?!'-]+$/i.test(q));
    // Topic Identification
    const hasPalay = /palay|humay|rice|paddy/i.test(q) || cropHint.includes('palay') || cropHint.includes('rice');
    const hasMais = /mais|corn/i.test(q) || cropHint.includes('mais') || cropHint.includes('corn');
    const hasTalong = /talong|eggplant/i.test(q) || cropHint.includes('talong');
    const hasKamatis = /kamatis|tomato/i.test(q) || cropHint.includes('kamatis');
    const hasSili = /sili|pepper|chili/i.test(q) || cropHint.includes('sili');
    const hasAmpalaya = /ampalaya|bitter gourd/i.test(q) || cropHint.includes('ampalaya');
    const hasSaging = /saging|banana/i.test(q) || cropHint.includes('saging');
    const hasMangga = /mangga|mango/i.test(q) || cropHint.includes('mangga');
    const hasSibuyas = /sibuyas|onion/i.test(q) || cropHint.includes('sibuyas');
    const hasArmyworm = /armyworm|harabas|fall armyworm|faw|uod sa mais/i.test(q);
    const hasStemBorer = /stem borer|uod sa tangkay|aksip|whitehead|deadheart/i.test(q);
    const hasKuhol = /kuhol|golden apple snail|golden kuhol/i.test(q);
    const hasBacterialWilt = /bacterial wilt|lanta|nalalanta|namamayat|biglang lanta/i.test(q);
    const hasYellowing = /naninilaw|dilaw|yellow|yellowing|chlorosis|dalag/i.test(q);
    const hasFlowerDrop = /nalalagas|lagas|bulaklak|bunga|flower drop|fruit drop|hulog/i.test(q);
    const hasFertilizer = /pataba|abono|fertilizer|urea|14-14-14|complete|potash|16-20-0|compost|foliar|npk/i.test(q);
    const hasWatering = /dilig|pagdidilig|tubig|water|watering|irrigation|bisbis/i.test(q);
    const hasOrganic = /organic|organiko|natural|calphos|faa|fpj|ffj|vermicast|neem|kakawate|sili spray/i.test(q);
    const hasRainySeason = /tag-ulan|ulan|rain|rainy|baha|wet season/i.test(q);
    const hasDrySeason = /tag-init|araw|drought|el nino|el niño|dry season/i.test(q);
    let answer = '';
    let cautions;
    let followUps = [];
    let disclaimer = 'Paalala mula sa AgriMate: Pang-edukasyon ang gabay na ito. Kumonsulta sa inyong lokal na Municipal Agriculture Office (MAO/DA) para sa pagsusuri sa inyong lugar.';
    // ================= TAGALOG / FILIPINO KNOWLEDGE BASE =================
    if (isTagalog || (!isBisaya && (hasPalay || hasMais || hasTalong || hasKamatis || hasSili || hasAmpalaya || hasFertilizer || hasWatering))) {
        // 1. PALAY (RICE) SPECIFIC
        if (hasPalay) {
            if (hasFertilizer) {
                answer = `🌾 **Gabay sa Wastong Pag-aabono ng Palay (Rice Fertilizer Schedule):**

1. **Basal Application (0–14 Araw Pagkatanim / DAT):**
   - Maglagay ng **14-14-14 (Complete)** o **16-20-0** kasama ang kalahating sako ng Urea.
   - *Kahalagahan:* Pinalalakas ang ugat at sinisimulan ang maagang pagsuwi (tillering).

2. **Mid-Tillering (21–28 DAT):**
   - Mag-topdress ng **Urea (46-0-0)** upang maparami ang mabubuting anak o suwi.
   - *Palatandaan:* Tiyaking may manipis na tubig (1–2 cm) ang pinitak bago magsabog.

3. **Panicle Initiation (Bago Magbuntis / 40–45 DAT):**
   - Maglagay ng natitirang Urea at **0-0-60 (Muriate of Potash)**.
   - *Kahalagahan:* Pampabigat at pampataba ng butil; pampatibay ng uhay laban sa pagdapa at peste.

💡 *Tip:* Gumamit ng Leaf Color Chart (LCC) upang hindi masobrahan sa Urea na nagiging sanhi ng paninilaw o pag-akit sa peste.`;
                followUps = [
                    'Paano sugpuin ang stem borer o aksip sa palay?',
                    'Ano ang Alternate Wetting and Drying (AWD) sa patubig?',
                    'Paano puksain ang golden kuhol bago magtanim?',
                ];
            }
            else if (hasStemBorer || q.includes('aksip') || q.includes('uod')) {
                answer = `🌾 **Pagsugpo sa Stem Borer (Aksip / Whiteheads) sa Palay:**

- **Palatandaan:** 
  - *Deadheart:* Patay na gitnang talbos sa panahong bata pa ang palay.
  - *Whitehead:* Maputing uhay na walang laman kapag namumulaklak na.

- **Mabisang Solusyon:**
  1. **Magkabit ng Pheromone o Light Traps:** Upang mahuli ang mga paruparo sa gabi bago makapangitlog.
  2. **Panatilihin ang mga Kaibigang Insekto:** Huwag mag-spray agad ng malalakas na kemikal upang mabuhay ang mga gagamba, tutubi, at trichogramma wasps.
  3. **Wastong Tubig:** Panatilihing may 3–5 cm na tubig sa pinitak upang mahirapan ang uod na lumipat ng tangkay.
  4. **Targeted Control:** Kung lalampas sa 5% ang deadheart, mag-spray ng systemic insecticide sa hapon (sundin ang rekomendasyon ng DA/LGU).`;
                cautions = [
                    'Magsuot ng proteksyon (maskara, bota, guwantes) kapag nag-spray.',
                    'Huwag mag-spray kapag humahangin o magbubukid ang mga alagang hayop.',
                ];
                followUps = [
                    'Kailan dapat magbawas ng tubig sa palayan bago anihin?',
                    'Anong pataba ang pampabigat ng butil ng palay?',
                ];
            }
            else if (hasKuhol) {
                answer = `🐌 **Mabisang Paraan Laban sa Golden Kuhol sa Palayan:**

1. **Herding & Canal Trapping:** Gumawa ng maliliit na kanal sa gilid ng pinitak; doon magtitipon ang mga kuhol kapag pinababaan ang tubig upang madaling pulutin.
2. **Paglalagay ng Pamingwit (Screen/Mesh):** Maglagay ng lambat o screen sa labasan at pasukan ng patubig upang hindi makapasok ang mga kuhol mula sa irigasyon.
3. **Natural na Pagkain:** Maglagay ng dahon ng gabi, papaya, o saging sa gilid ng pinitak bilang pain para doon magtipon bago manu-manong kunin.
4. **Pangangasiwa ng Tubig:** Magpatubig lamang ng mababaw (1–2 cm) sa unang 15 araw paglipat-tanim upang hindi makagalaw ang kuhol.`;
                followUps = [
                    'Paano maparami ang suwi ng palay?',
                    'Ano ang mabisang organikong pataba sa palayan?',
                ];
            }
            else {
                answer = `🌾 **Pangkalahatang Gabay sa Masaganang Ani ng Palay:**

1. **Binhi:** Gumamit ng sertipikadong binhi (Inbred tulad ng NSIC Rc 222, Rc 216 o Hybrid na angkop sa inyong lugar).
2. **Paghahanda ng Lupa:** Araruhin at suyurin nang maigi ang lupa (hindi bababa sa 21 araw bago maglipat-tanim) upang mabulok ang damo at dayami.
3. **Agwat ng Tanim:** 20 cm x 20 cm tuwing tag-araw, at 20 cm x 25 cm tuwing tag-ulan para sa sapat na sikat ng araw at hangin.
4. **Pamamahala sa Tubig:** Ipatupad ang Alternate Wetting and Drying (AWD) upang makatipid sa tubig at mapatibay ang mga ugat.`;
                followUps = [
                    'Anong pataba ang kailangan ng palay sa unang 30 araw?',
                    'Paano maiiwasan ang rice blast at bacterial leaf blight?',
                ];
            }
        }
        // 2. MAIS (CORN) SPECIFIC
        else if (hasMais) {
            if (hasArmyworm || q.includes('uod') || q.includes('peste')) {
                answer = `🌽 **Pagsugpo sa Fall Armyworm (FAW / Harabas) sa Mais:**

- **Palatandaan:** Butas-butas na dahon na may parang sawdust o pulbos na dumi ng uod sa gitnang talbos (whorl).

- **Mga Hakbang sa Lunas:**
  1. **Ash / Abo ng Kalan o Buhangin:** Maghulog ng kaunting pinong abo o buhangin sa gitnang talbos ng mais maaga sa umaga. Makakairita ito sa uod at magiging sanhi ng pagkamatay nito.
  2. **Organikong Pang-spray (Neem / Sili / Bawang):** Mabisang pangtaboy sa mga bata pang uod kapag ini-spray sa hapon direkta sa talbos.
  3. **Biological Control (Trichogramma / Metarhizium):** Humingi ng libreng trichogramma cards sa inyong DA/CENRO o Municipal Agriculture Office.
  4. **Targeted Spray:** Kung matindi ang sira (>10% ng taniman), mag-spray ng aprubadong bio-pesticide (tulad ng Bacillus thuringiensis o Emamectin benzoate) na nakatutok sa buko/talbos.`;
                cautions = [
                    'Magsuot ng maskara at damit na mahaba kapag nag-spray.',
                    'Umiwas mag-spray kapag matirik ang araw.',
                ];
                followUps = [
                    'Kailan dapat mag-side dress ng Urea sa mais?',
                    'Paano malalaman kung puwede nang anihin ang mais?',
                ];
            }
            else if (hasFertilizer) {
                answer = `🌽 **Gabay sa Pag-aabono ng Mais:**

1. **Basal (Bago o Habang Nagtatanim):**
   - Maglagay ng Complete 14-14-14 o 16-20-0 sa ilalim ng tudling bago tabunan ng manipis na lupa at ilagay ang buto.
2. **First Side-Dress (20–25 Araw Pagkatubo / V6 Stage):**
   - Maglagay ng Urea (46-0-0) mga 5–7 cm ang layo sa puno ng mais. Tabunan agad ng lupa upang hindi sumingaw ang nitroheno.
3. **Second Side-Dress / Hilling-up (40–45 Araw):**
   - Maglagay ng natitirang Urea at kaunting Potash bago mag-hilling-up (pagtataas ng lupa sa puno).`;
                followUps = [
                    'Paano maiiwasan ang pagkatumba ng mais kapag mahangin?',
                    'Paano kontrolin ang armyworm sa mais?',
                ];
            }
            else {
                answer = `🌽 **Mga Tip sa Pagpaparami ng Ani ng Mais:**

1. **Distansya ng Tanim:** 75 cm ang pagitan ng tudling at 20–25 cm bawat buto (1 buto bawat butas para sa hybrid).
2. **Bungkal at Gahok:** Mag-cultivate at hilling-up sa ika-25 hanggang 30 araw upang mabaon ang ugat at makontrol ang damo.
3. **Pagtubig:** Huwag pabayaang matuyuan ang mais sa panahon ng pamumulaklak (tasseling at silking) dahil dito nabubuo ang mga butil.`;
                followUps = [
                    'Ano ang mabisang pamatay sa armyworm sa mais?',
                    'Anong abono ang kailangan ng mais?',
                ];
            }
        }
        // 3. KAMATIS, TALONG, SILI (SOLANACEOUS CROPS)
        else if (hasKamatis || hasTalong || hasSili) {
            const cropName = hasKamatis ? 'kamatis' : hasTalong ? 'talong' : 'sili';
            if (hasBacterialWilt || q.includes('lanta')) {
                answer = `🍆 **Lunas sa Bacterial Wilt / Biglang Pagkalanta ng ${cropName}:**

- **Palatandaan:** Biglang nalalanta ang halaman kahit basa ang lupa, habang berde pa ang dahon (hindi dumaan sa paninilaw).
- **Sanhi:** Bakterya sa lupa (*Ralstonia solanacearum*) na pumapasok sa mga sugat sa ugat.

- **Dapat Gawin:**
  1. **Bunutin Agad:** Bunutin ang apektadong tanim kasama ang lupa sa paligid ng ugat. Ilagay sa sako at sunugin o ibaon malayo sa taniman. **Huwag ilagay sa compost!**
  2. **Apog (Hydrated Lime):** Budburan ng apog ang butas na pinagbunutan upang mapigilan ang pagkalat ng bakterya.
  3. **Lunas sa Hinaharap:** Mag-crop rotation — huwag magtanim ng kamatis, talong, o sili sa parehong lupa sa loob ng 2 taon. Magtanim muna ng mais o palay.
  4. **Gumamit ng Trichoderma:** Ihalo ang Trichoderma sa lupa bago maglipat-tanim upang protektahan ang mga ugat laban sa mikrobyo.`;
                followUps = [
                    'Paano maiiwasan ang blossom-end rot o pangingitim ng puwit ng kamatis?',
                    'Bakit nalalagas ang bulaklak ng talong o kamatis?',
                ];
            }
            else if (hasFlowerDrop) {
                answer = `🌸 **Bakit Nalalagas ang Bulaklak ng ${cropName} at Paano Ito Malulunasan?**

1. **Sobra o Kulang sa Tubig:**
   - Kapag masyadong tuyo o sobrang basang-basa ang lupa, nagugulat ang ugat at inilalaglag ang bulaklak. Panatilihing katamtaman ang basa.
2. **Kulang sa Calcium at Boron:**
   - Ang calcium at boron ang nagpapatibay sa tangkay ng bulaklak. Mag-spray ng CalPhos (Calcium Phosphate mula sa balat ng itlog at suka) o water-soluble calcium spray.
3. **Mataas na Temperatura (>35°C):**
   - Ang sobrang init ay nagpapatuyo sa polen. Diligan nang maaga sa umaga at maglagay ng mulch (dayami) sa paligid ng puno.
4. **Sobra sa Nitroheno (Urea):**
   - Kung sobra sa Urea, magiging malago ang mga dahon ngunit malalagas ang bulaklak. Palitan ng pataba na mataas sa Phosphorus at Potassium (tulad ng 0-0-60 o bone meal).`;
                followUps = [
                    'Paano gumawa ng CalPhos gamit ang balat ng itlog?',
                    'Paano puksain ang fruit borer sa talong at kamatis?',
                ];
            }
            else if (q.includes('fruit borer') || q.includes('butas') || q.includes('peste')) {
                answer = `🐛 **Pagkontrol sa Fruit Borer at Uod sa ${cropName}:**

1. **Pruning ng Sirang Bunga:** Pitasin agad ang mga bunga at talbos na may butas at ibaon sa lupa upang hindi makalabas ang uod.
2. **Pheromone Traps:** Maglagay ng yellow sticky traps at lure traps upang mahuli ang mga insektong lumilipad bago makapangitlog sa bulaklak.
3. **Kakawate at Sili Spray:** Magdikdik ng dahon ng kakawate (madre de cacao) at siling labuyo na may kaunting sabon; i-spray linggu-linggo tuwing hapon.
4. **Bacillus thuringiensis (Bt):** Isang ligtas at organikong pambala na pumupuksa lamang sa mga uod nang hindi nakalalason sa tao o bubuyog.`;
                followUps = [
                    'Anong organikong pataba ang maganda sa pamumunga?',
                    'Paano maiiwasan ang paninilaw ng dahon ng kamatis?',
                ];
            }
            else {
                answer = `🌱 **Mahahalagang Gabay sa Pag-aalaga ng ${cropName}:**

1. **Pagpupunla:** 25–30 araw ang punla bago ilipat sa kamada o plot tuwing hapon upang hindi malanta sa init.
2. **Paglalagay ng Tulos o Balag:** Magtulos ng kawayan o tali pagtuntong ng 3 linggo upang hindi sumayad sa lupa ang mga sanga at bunga.
3. **Pangangalaga sa Lupa:** Maglagay ng compost at tuyong dayami bilang mulch upang mapigilan ang damo at matipid ang tubig.`;
                followUps = [
                    'Bakit nagkakaroon ng itim sa puwit ang kamatis (blossom end rot)?',
                    'Paano maparami ang bulaklak at bunga ng talong?',
                ];
            }
        }
        // 4. GENERAL FERTILIZERS & ORGANICS
        else if (hasFertilizer || hasOrganic) {
            answer = `🌿 **Gabay sa Mabisang Pagpapataba at Organikong Abono:**

1. **Kailan Ginagamit ang mga Pangunahing Abono (NPK):**
   - **Nitrogen (N - Urea / 46-0-0):** Para sa mabilis na paglaki ng berdeng dahon at tangkay (yugto ng kabataan).
   - **Phosphorus (P - 16-20-0 o Bone Meal):** Para sa malalakas na ugat at maagang pamumulaklak.
   - **Potassium (K - 0-0-60 o Abono sa Bunga):** Pampabigat, pampatamis, at pampalaki ng bunga; pampatibay laban sa tagtuyot at peste.

2. **Mabisang Organikong Likido (DIY Concoctions):**
   - **FAA (Fish Amino Acid):** Dumi ng isda + molasses para sa mataas na nitrogen.
   - **FPJ (Fermented Plant Juice):** Talbos ng kangkong/kamote + brown sugar para sa pampalago.
   - **CalPhos:** Inihaw na balat ng itlog ibinabad sa sukang tuba (1:10) — mabisang pampatibay ng bulaklak at bunga laban sa pagkalagas.

⚠️ *Paalala:* Mag-abono lamang kapag basa ang lupa at huwag idikit ang butil ng kemikal sa mismong puno ng halaman upang hindi mapaso ang balat at ugat.`;
            cautions = [
                'Huwag mag-abono kapag napakainit ng sikat ng araw sa tanghali.',
                'Magsuot ng guwantes kapag naghahalo ng kemikal na pataba.',
            ];
            followUps = [
                'Paano gumawa ng organikong pataba (compost) sa bakuran?',
                'Paano i-apply ang foliar fertilizer sa mga gulay?',
            ];
        }
        // 5. WATERING & SOIL
        else if (hasWatering) {
            answer = `💧 **Wastong Pamamaraan ng Pagdidilig sa Halaman:**

1. **Pinakamainam na Oras:**
   - **Maaga sa Umaga (6:00 AM – 8:30 AM):** Pinakamainam dahil masisipsip ng ugat bago sumikat ang araw, at matutuyo ang mga dahon upang hindi pamahayan ng amag (fungus).
2. **Malalim na Dilig (Deep Watering):**
   - Mas mainam magdilig nang malalim 2–3 beses sa isang linggo kaysa magwisik nang mababaw araw-araw. Hinuhimok nito ang ugat na humaba pailalim.
3. **The Finger Test (Subok ng Daliri):**
   - Itusok ang daliri nang 2 pulgada sa lupa. Kung basa pa, huwag munang diligan. Kung tuyo na, diligan sa mismong puno (iwasang basain ang dahon).
4. **Paggamit ng Mulch (Dayami):**
   - Maglatag ng tuyong dayami o dahon sa paligid ng puno upang mapanatili ang lamig at kahalumigmigan sa lupa.`;
            followUps = [
                'Ano ang gagawin kapag sunod-sunod ang ulan sa taniman?',
                'Paano malalaman kung maayos ang daloy ng tubig (drainage)?',
            ];
        }
        // 6. WEATHER ADAPTATION
        else if (hasRainySeason || hasDrySeason) {
            if (hasRainySeason) {
                answer = `🌧️ **Paghahanda at Pangangalaga ng Pananim sa Tag-ulan:**

1. **Gawaing Pang-drainage:** Palalimin ang mga kanal sa paligid ng kamada upang hindi magka-tubig-baha na sumasakal sa mga ugat.
2. **Taasan ang Kamada (Raised Beds):** Magtanim sa kamada na may taas na 20–30 cm mula sa lupa.
3. **Fungus Prevention:** Madalas ang amag kapag laging basa. Mag-spray ng organikong Trichoderma o bio-fungicide pagkatapos humupa ang ulan.
4. **Pruning:** Alisin ang mga dahong sumasayad sa basang lupa upang hindi maging daanan ng impeksyon.`;
            }
            else {
                answer = `☀️ **Pangangalaga ng Pananim sa Tag-init at Tagtuyot (El Niño):**

1. **Makapal na Mulch:** Maglatag ng 3–4 pulgadang dayami sa paligid ng bawat puno upang hindi sumingaw ang tubig.
2. **Drip Irrigation o Boteng Patubig:** Gumamit ng recycled plastic bottles na may maliit na butas sa ilalim para sa dahan-dahang patubig direkta sa ugat.
3. **Shade Nets:** Maglagay ng 30–50% shade net para sa mga sensitibong gulay (tulad ng kamatis at litsugas).`;
            }
            followUps = [
                'Anong mga gulay ang magandang itanim sa tag-ulan?',
                'Paano makatitipid sa tubig sa panahon ng tag-araw?',
            ];
        }
        // 7. YELLOWING LEAVES (PANINILAW)
        else if (hasYellowing) {
            answer = `🍂 **Pagsusuri sa Paninilaw ng Dahon ng Halaman:**

1. **Kung ang naninilaw ay mga LUMANG DAHON sa IBABA:**
   - *Sanhi:* Kakulangan sa **Nitrogen** o kaya ay **Sobra sa Tubig**.
   - *Lunas:* Suriin ang lupa. Kung basang-basa, bawasan ang dilig. Kung tuyo at matigas, maglagay ng compost o kaunting Urea.

2. **Kung ang naninilaw ay mga BATANG DAHON sa ITAAS:**
   - *Sanhi:* Kakulangan sa **Iron, Zinc, o Micronutrients**, o kaya ay mataas ang asido ng lupa (soil acidity).
   - *Lunas:* Mag-spray ng foliar micronutrient spray o maglagay ng vermicast sa puno.

3. **Kung Dilaw na may Batik-Batik o Kulot:**
   - *Sanhi:* Peste (aphids, thrips, whiteflies) na may dalang virus.
   - *Lunas:* Mag-spray ng sili-sabong timpla at puksain ang mga kuto sa ilalim ng dahon.`;
            followUps = [
                'Paano maghalo ng organikong spray gamit ang sili at sabon?',
                'Paano sukatin o ayusin ang asido (pH) ng lupa?',
            ];
        }
        // DEFAULT COMPREHENSIVE TAGALOG ADVICE
        else {
            answer = `🌾 **AgriMate AI — Praktikal na Gabay sa Pagsasaka:**

Narito ang mga hakbang para mapanatiling malusog at mataas ang ani ng inyong mga pananim:

1. **Pangangalaga sa Lupa:**
   - Ang malusog na lupa ang susi sa masaganang ani. Maghalo ng 1–2 pulgadang compost o vermicast bawat taniman.
2. **Pangangasiwa sa Tubig:**
   - Diligan sa maagang umaga (6:00 AM – 8:30 AM). Iwasang magbabad ng tubig sa ugat kung hindi palay ang tanim.
3. **Maagang Pagsugpo sa Peste:**
   - Regular na inspeksyunin ang ilalim ng mga dahon 2 beses sa isang linggo. Ang maagang pag-agap ay nakapagliligtas ng hanggang 80% ng inyong ani.
4. **Tamang Agwat ng Tanim:**
   - Mag-iwan ng sapat na pagitan para makapasok ang sikat ng araw at simoy ng hangin upang maiwasan ang amag at fungal disease.

*Mayroon ka bang partikular na pananim (hal. palay, mais, kamatis, talong, sili) o sakit ng halaman na nais mong itanong?*`;
            followUps = [
                'Paano maparami ang bunga ng aking mga gulay?',
                'Ano ang mabisang pampuksa sa mga uod at peste?',
                'Kailan ang tamang panahon ng paglalagay ng abono?',
            ];
        }
    }
    // ================= BISAYA / CEBUANO KNOWLEDGE BASE =================
    else if (isBisaya) {
        disclaimer =
            'Pahinumdom gikan sa AgriMate: Kini nga giya pang-edukasyon lamang. Pakigkita sa inyong lokal nga Municipal Agriculture Office (MAO/DA) alang sa piho nga giya sa inyong dapit.';
        if (hasPalay) {
            answer = `🌾 **Giya sa Saktong Pag-abono ug Pag-atiman sa Humay (Rice):**

1. **Basal (0–14 ka adlaw human itanom):** Butangi og 14-14-14 (Complete) o 16-20-0 aron molig-on ang gamot ug mosugod ang pagpaningsing.
2. **Mid-Tillering (21–28 ka adlaw):** Sabogi og Urea (46-0-0) aron modaghan ang mabungahong suwi.
3. **Pagsugod og Sabak / Panicle Initiation (40–45 ka adlaw):** Butangi og Muriate of Potash (0-0-60) ug gamayng Urea aron bug-at ug himsog ang mga uhay.
4. **Pagsanta sa Aksip (Stem Borer):** Butangi og suga o traps sa gabii ug i-monitor ang sentro sa tanom.`;
            followUps = [
                'Unsaon pagpatay sa kuhol sa basakan?',
                'Unsa ang Alternate Wetting and Drying (AWD)?',
            ];
        }
        else if (hasMais) {
            answer = `🌽 **Giya sa Mais ug Pagsugpo sa Harabas (Fall Armyworm):**

1. **Abo o Pinong Balas:** Butangi og gamayng abo sa abohan ang tumoy/talbos sa mais sayo sa buntag aron mamatay ang mga ulod.
2. **Organikong Spray:** Dukduka ang dahon sa madre de cacao (kakawate) ug sili, isagol sa tubig nga may gamayng sabon, ug i-spray sa hapon.
3. **Pag-abono:** Mag-side dress og Urea sa ika-25 ug ika-40 ka adlaw human sa pagturok sa mais.`;
            followUps = [
                'Kanus-a ang saktong oras sa pag-ani sa mais?',
                'Unsaon pag-atiman sa mais panahon sa ting-init?',
            ];
        }
        else {
            answer = `🌱 **Praktikal nga mga Giya sa Pagsasaka gikan sa AgriMate:**

1. **Pag-atiman sa Yuta:** Butangi og 1–2 ka pulgada nga compost o kinalibang sa manok/baka ang palibot sa tanom.
2. **Saktong Pagbisbis:** Bisbisi sayo sa buntag aron matuhop sa gamot sa dili pa moinit ang adlaw.
3. **Pagsusi sa Tanom:** Susiha ang ilalom sa mga dahon kaduha sa usa ka semana aron masanta dayon ang mga dangan o peste.
4. **Mulch:** Butangi og uhot o uga nga dahon sa punoan aron mapreserbar ang kaumog sa yuta.`;
            followUps = [
                'Unsay maayong organikong abono sa pamulak?',
                'Nganong dalag man ang dahon sa akong tanom?',
            ];
        }
    }
    // ================= ENGLISH KNOWLEDGE BASE =================
    else {
        if (hasPalay) {
            answer = `🌾 **Rice Crop Management & High-Yield Guide:**

1. **Fertilizer Protocol:**
   - *Basal (0–14 DAT):* Complete 14-14-14 or 16-20-0 for strong root establishment.
   - *Tillering (21–28 DAT):* Top-dress Urea (46-0-0) to maximize productive tillers.
   - *Panicle Initiation (40–45 DAT):* Apply Muriate of Potash (0-0-60) and remaining Nitrogen for grain density and lodging prevention.
2. **Pest Defense:**
   - *Stem Borer:* Install solar or light traps; preserve natural spiders and trichogramma parasitoids.
   - *Golden Apple Snail:* Dig peripheral drainage trenches; hand-pick snails using papaya leaf baits.
3. **Water Management:**
   - Use Alternate Wetting and Drying (AWD) tube to save 30% irrigation water while boosting root oxygen.`;
            followUps = [
                'How do I treat rice blast disease naturally?',
                'What is the ideal soil pH for paddy rice?',
            ];
        }
        else if (hasMais) {
            answer = `🌽 **Corn (Maize) Nutrition & Armyworm Management:**

1. **Fall Armyworm (FAW) Protocol:**
   - Deposit a pinch of fine wood ash or sand into the central leaf whorl early morning to desiccate young larvae.
   - Apply Neem oil or Bacillus thuringiensis (Bt) targeted directly into the whorl during late afternoon.
2. **Nutrient Schedule:**
   - Basal application of Complete 14-14-14 at planting.
   - Side-dress Urea at V6 stage (20–25 DAP) 5 cm from stalk, covered with soil.
   - Hill-up at 35–40 DAP to anchor root systems against seasonal winds.`;
            followUps = [
                'How much water does corn need during silking?',
                'What causes stunted yellow corn leaves?',
            ];
        }
        else if (hasKamatis || hasTalong || hasSili) {
            answer = `🍅 **Solanaceous Vegetables (Tomato, Eggplant, Pepper) Advisory:**

1. **Bacterial Wilt:** If plants wilt suddenly while foliage remains green, immediately rogue out infected plants with root-zone soil. Drench the hole with hydrated lime. Rotate with grasses or corn.
2. **Blossom Drop Prevention:** Avoid sudden soil drying cycles. Supplement with Calcium Phosphate (CalPhos) or water-soluble calcium-boron foliar spray during flowering.
3. **Fruit Borer Protection:** Prune and bury bored fruits; deploy yellow sticky cards and pheromone traps to disrupt adult moth mating cycles.`;
            followUps = [
                'How do I brew homemade Calcium Phosphate (CalPhos)?',
                'How often should I prune suckers on indeterminate tomatoes?',
            ];
        }
        else {
            answer = `🌱 **AgriMate Smart Farming Comprehensive Advisory:**

1. **Soil Resilience:** Incorporate 2 inches of compost or vermicast annually. Healthy soil microbiology prevents root-knot nematodes and root rot.
2. **Irrigation Timing:** Irrigate between 6:00 AM and 8:30 AM at the root base. Keeping water off foliage deters fungal spores.
3. **Integrated Pest Management (IPM):** Scout plots twice weekly. Catching early pest thresholds saves up to 80% of crop yields without heavy synthetic chemicals.
4. **Mulching:** Maintain a 2-inch organic mulch (straw or dried leaves) around crop bases to reduce evaporation and suppress weed germination.`;
            followUps = [
                'How do I make organic pesticide from chili and soap?',
                'What are the signs of nitrogen deficiency in vegetables?',
            ];
        }
    }
    return {
        answer,
        cautions,
        follow_up_suggestions: followUps,
        disclaimer,
    };
}
