/**
 * Client-Side Offline Agricultural Assistant for AgriMate
 * Provides immediate, responsive answers on device for all crop queries
 * when network connection is slow, unavailable, or offline in rural fields.
 */

export interface ChatResponsePayload {
  conversation_id: string;
  answer: string;
  cautions?: string[];
  follow_up_suggestions: string[];
  disclaimer: string;
}

export function answerCropQueryLocally(
  query: string,
  conversationId?: string,
  context?: { cropName?: string; preferredLanguage?: string }
): ChatResponsePayload {
  const q = query.toLowerCase().trim();
  const cropHint = context?.cropName?.toLowerCase() || '';

  // Language detection
  const hasTagalogWords = /\b(ano|anong|bakit|paano|kailan|mabisa|pamatay|gamot|paraan|sugpuin|lunas|tanim|magtanim|dahon|palay|pataba|dilig|uod|lupa|bulaklak|bunga|paninilaw|naninilaw)\b/i.test(q);
  const hasBisayaWords = /\b(ngano|unsa|unsaon|kanus-a|palihog|dangan|yuta|tanom|kapayas|humay|bisbis)\b/i.test(q);

  const isBisaya = (hasBisayaWords || context?.preferredLanguage === 'Bisaya') && !hasTagalogWords;
  const isTagalog = hasTagalogWords || context?.preferredLanguage === 'Tagalog' || (!isBisaya && /^[a-z0-9\s.,?!'-]+$/i.test(q));

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
  let cautions: string[] | undefined;
  let followUps: string[] = [];
  let disclaimer =
    'Paalala mula sa AgriMate: Pang-edukasyon ang gabay na ito. Kumonsulta sa inyong lokal na Municipal Agriculture Office (MAO/DA) para sa pagsusuri sa inyong lugar.';

  // TAGALOG LOGIC
  if (isTagalog || (!isBisaya && (hasPalay || hasMais || hasTalong || hasKamatis || hasSili || hasAmpalaya || hasFertilizer || hasWatering))) {
    if (hasPalay) {
      if (hasFertilizer) {
        answer = `🌾 **Wastong Pag-aabono sa Palay (Fertilizer Schedule):**

1. **Basal Application (0–14 Araw Pagkatanim):**
   - Maglagay ng **14-14-14 (Complete)** o **16-20-0** kasama ang kalahating sako ng Urea.
   - Pinalalakas nito ang ugat at pinasisimulan ang maagang pagsuwi.

2. **Mid-Tillering (21–28 DAT):**
   - Mag-topdress ng **Urea (46-0-0)** upang maparami ang mabubuting suwi.
   - Tiyaking may manipis na tubig (1–2 cm) sa pinitak bago magsabog.

3. **Panicle Initiation (Bago Magbuntis / 40–45 DAT):**
   - Maglagay ng **0-0-60 (Muriate of Potash)** at natitirang Urea para pampabigat at pampataba ng butil.`;
        followUps = [
          'Paano sugpuin ang stem borer o aksip sa palay?',
          'Ano ang Alternate Wetting and Drying (AWD) sa patubig?',
          'Paano puksain ang golden kuhol bago magtanim?',
        ];
      } else if (hasStemBorer || q.includes('aksip') || q.includes('uod')) {
        answer = `🌾 **Pagsugpo sa Stem Borer (Aksip / Deadheart / Whitehead) sa Palay:**

- **Palatandaan:** Patay na gitnang talbos (deadheart) sa murang palay, o maputing walang lamang uhay (whitehead).
- **Mabisang Solusyon:**
  1. Magkabit ng light traps o pheromone traps sa gabi upang mahuli ang mga paruparo.
  2. Panatilihing may 3–5 cm na tubig upang mahirapang lumipat ang uod.
  3. Huwag mag-spray ng labis na kemikal upang mabuhay ang mga gagamba at kapaki-pakinabang na insekto.`;
        cautions = ['Magsuot ng proteksyon kapag gumagamit ng pang-spray.'];
        followUps = [
          'Anong pataba ang kailangan ng palay sa unang 30 araw?',
          'Kailan dapat magbawas ng tubig sa palayan bago anihin?',
        ];
      } else if (hasKuhol) {
        answer = `🐌 **Pagkontrol sa Golden Kuhol sa Palayan:**

1. **Kanal sa Gilid:** Maghukay ng maliliit na kanal sa gilid ng pinitak upang doon magtipon ang mga kuhol kapag pinababaw ang tubig.
2. **Pangharang:** Maglagay ng lambat o screen sa labasan at pasukan ng patubig.
3. **Pain:** Maglagay ng dahon ng gabi o papaya sa tabi ng pinitak para doon magtipon bago manu-manong pulutin.
4. **Mababaw na Tubig:** Panatilihing 1–2 cm lamang ang tubig sa unang 15 araw paglipat-tanim.`;
        followUps = [
          'Paano maparami ang suwi ng palay?',
          'Ano ang mabisang organikong pataba sa palayan?',
        ];
      } else {
        answer = `🌾 **Gabay sa Masaganang Ani ng Palay:**

1. Gumamit ng sertipikadong binhi (tulad ng NSIC Rc 222 o Rc 216).
2. Ihanda nang maigi ang lupa hindi bababa sa 21 araw bago maglipat-tanim.
3. Agwat ng tanim: 20x20 cm sa tag-araw, 20x25 cm sa tag-ulan.
4. Magpatupad ng Alternate Wetting and Drying (AWD) para sa matitibay na ugat.`;
        followUps = [
          'Anong pataba ang kailangan ng palay sa unang 30 araw?',
          'Paano puksain ang mga peste sa palayan?',
        ];
      }
    } else if (hasMais) {
      if (hasArmyworm || q.includes('uod') || q.includes('peste')) {
        answer = `🌽 **Pagsugpo sa Fall Armyworm (FAW / Harabas) sa Mais:**

- **Palatandaan:** Butas-butas na dahon na may parang sawdust o pulbos na dumi sa gitnang talbos (whorl).
- **Mabilis na Lunas:**
  1. **Abo ng Kalan:** Maghulog ng kaunting pinong abo o buhangin sa gitnang talbos ng mais maaga sa umaga.
  2. **Organikong Spray:** Magdikdik ng sili at dahon ng kakawate na may kaunting sabon, i-spray sa hapon nakatutok sa talbos.
  3. **Biopesticide:** Mag-spray ng Bacillus thuringiensis (Bt) kung lampas 10% ng tanim ang inatake.`;
        cautions = ['Mag-spray lamang sa hapon upang hindi masunog ang dahon sa araw.'];
        followUps = [
          'Kailan dapat mag-side dress ng Urea sa mais?',
          'Paano malalaman kung puwede nang anihin ang mais?',
        ];
      } else {
        answer = `🌽 **Pangangalaga at Pagpaparami ng Ani ng Mais:**

1. **Distansya ng Tanim:** 75 cm ang pagitan ng tudling at 20–25 cm bawat buto.
2. **Pag-aabono:** Basal 14-14-14 sa pagtatanim; side-dress ng Urea sa ika-25 araw at bago mag-hilling-up sa ika-40 araw.
3. **Pagtubig:** Siguraduhing may sapat na moisture kapag nagsisimula nang mamulaklak (silking at tasseling).`;
        followUps = [
          'Ano ang mabisang pamatay sa armyworm sa mais?',
          'Anong abono ang kailangan ng mais?',
        ];
      }
    } else if (hasKamatis || hasTalong || hasSili) {
      const crop = hasKamatis ? 'kamatis' : hasTalong ? 'talong' : 'sili';
      if (hasBacterialWilt || q.includes('lanta')) {
        answer = `🍆 **Lunas sa Bacterial Wilt / Biglang Pagkalanta ng ${crop}:**

- **Palatandaan:** Biglang pagkalanta kahit basa ang lupa habang luntiang-berde pa ang mga dahon.
- **Aksyong Dapat Gawin:**
  1. **Bunutin Agad:** Bunutin ang tanim kasama ang lupa sa ugat at sunugin o ibaon malayo sa taniman. Huwag ihalo sa compost!
  2. **Apog:** Lagyan ng apog (hydrated lime) ang pinagbunutang lupa para mapuksa ang bakterya.
  3. **Crop Rotation:** Magpalit ng pananim (magtanim muna ng mais o palay) bago magtanim muli ng ${crop}.`;
        followUps = [
          'Paano maiiwasan ang blossom-end rot o pangingitim ng puwit ng kamatis?',
          'Bakit nalalagas ang bulaklak ng talong o kamatis?',
        ];
      } else if (hasFlowerDrop) {
        answer = `🌸 **Solusyon sa Pagkalagas ng Bulaklak ng ${crop}:**

1. **Kulang sa Calcium:** Mag-spray ng CalPhos (Calcium Phosphate mula sa inihaw na balat ng itlog at suka).
2. **Sobra sa Tubig o Sobrang Tuyot:** Panatilihing katamtaman ang kahalumigmigan ng lupa.
3. **Sobra sa Urea:** Bawasan ang nitrogen at maglagay ng pataba na may Phosphorus at Potassium.`;
        followUps = [
          'Paano gumawa ng CalPhos gamit ang balat ng itlog?',
          'Paano puksain ang fruit borer sa talong at kamatis?',
        ];
      } else {
        answer = `🌱 **Pangangalaga ng ${crop}:**

1. Maglagay ng balag o tulos pagtuntong ng 3 linggo para hindi sumayad sa lupa ang mga sanga.
2. Maglagay ng mulch (tuyong dayami) sa paligid ng puno para maiwasan ang damo at matipid ang tubig.
3. Pitasin agad ang mga dahong may sira o amag sa bandang ibaba.`;
        followUps = [
          'Bakit naninilaw ang dahon ng aking mga gulay?',
          'Ano ang mabisang pamatay sa mga peste at uod?',
        ];
      }
    } else if (hasFertilizer || hasOrganic) {
      answer = `🌿 **Gabay sa Wastong Pag-aabono at Organikong Pataba:**

1. **Urea (46-0-0):** Para sa dahon at tangkay sa yugto ng paglaki.
2. **Complete (14-14-14):** Balanseng pataba para sa ugat, tangkay, at dahon.
3. **Potash (0-0-60):** Pampalaki, pampatamis, at pampabigat ng bunga.
4. **Organikong Pataba:** Maglagay ng vermicast o compost 1–2 pulgada sa paligid ng puno.`;
      cautions = ['Huwag mag-abono sa tanghaling tapat kapag matirik ang araw.'];
      followUps = [
        'Paano gumawa ng organikong pataba (compost)?',
        'Kailan dapat mag-spray ng foliar fertilizer?',
      ];
    } else if (hasYellowing) {
      answer = `🍂 **Bakit Naninilaw ang Dahon ng Pananim?**

1. **Sobra sa Tubig:** Malambot at naninilaw ang dahon sa ibaba; nabubulok ang ugat dahil walang hangin.
2. **Kulang sa Tubig:** Tuyot ang lupa at kumukulubot ang dahon.
3. **Kulang sa Nitrogen:** Pantay na naninilaw ang mga lumang dahon sa ibaba.
4. **Solusyon:** Subukan ang lupa gamit ang daliri. Kung basa pa, huwag munang diligan. Kung tuyo, diligan sa puno maaga sa umaga.`;
      followUps = [
        'Ano ang mabisang pamatay-peste sa mga gulay?',
        'Kailan ang tamang oras ng pagdilig?',
      ];
    } else {
      answer = `🌾 **AgriMate AI — Handa sa Lahat ng Tanong sa Pagsasaka:**

1. **Pangangalaga sa Lupa:** Magdagdag ng compost o organikong pataba bawat taniman.
2. **Wastong Pagdilig:** Diligan maaga sa umaga (6:00 AM – 8:30 AM) upang masipsip bago uminit ang araw.
3. **Pagsusuri sa Peste:** Silipin ang ilalim ng dahon 2 beses kada linggo upang maagapan ang anumang problema.

*Maaari mong itanong ang tungkol sa iyong palay, mais, kamatis, talong, sili, pataba, o sakit ng halaman!*`;
      followUps = [
        'Bakit naninilaw ang dahon ng aking pananim?',
        'Paano sugpuin ang mga uod at peste?',
        'Anong abono ang kailangan sa pamumunga?',
      ];
    }
  }

  // BISAYA LOGIC
  else if (isBisaya) {
    disclaimer =
      'Pahinumdom: Gikan sa AgriMate alang sa edukasyon. Pakigkita sa inyong Municipal Agriculture Office (MAO/DA) alang sa piho nga giya.';
    if (hasPalay) {
      answer = `🌾 **Giya sa Humay (Rice):**
1. **Basal:** 14-14-14 sa unang 14 ka adlaw aron molig-on ang gamot.
2. **Pagsuwi:** Butangi og Urea (46-0-0) sa ika-21 hangtod 28 ka adlaw.
3. **Pamunga:** Butangi og 0-0-60 (Potash) sa ika-45 ka adlaw para mabug-at ang uhay.`;
      followUps = ['Unsaon pagpatay sa kuhol?', 'Unsaon paglikay sa aksip sa humay?'];
    } else {
      answer = `🌱 **AgriMate AI — Giya sa Pagpanguma:**
1. Butangi og compost o vermicast ang palibot sa tanom.
2. Bisbisi sayo sa buntag sa dili pa moinit ang adlaw.
3. Susiha ang ilalom sa mga dahon kaduha sa usa ka semana batok sa dangan.`;
      followUps = ['Nganong dalag ang dahon sa tanom?', 'Unsay maayong abono sa bunga?'];
    }
  }

  // ENGLISH LOGIC
  else {
    disclaimer =
      'AgriMate guidance is educational. Consult local agricultural extension officers for region-specific certifications and commercial dosing.';
    if (hasPalay) {
      answer = `🌾 **Rice Crop Management Guide:**
1. **Basal (0–14 DAT):** Complete 14-14-14 for root and early tiller development.
2. **Tillering (21–28 DAT):** Top-dress Urea (46-0-0) to maximize productive tillers.
3. **Panicle Initiation (40–45 DAT):** Apply Muriate of Potash (0-0-60) for grain filling and lodging prevention.`;
      followUps = ['How do I manage stem borers in rice?', 'What is the AWD water management method?'];
    } else if (hasMais) {
      answer = `🌽 **Corn & Fall Armyworm Protocol:**
1. Drop fine wood ash into the leaf whorl early morning to kill young larvae.
2. Apply Complete 14-14-14 at planting; side-dress Urea at 25 and 40 DAP.
3. Ensure adequate moisture during silking and grain filling.`;
      followUps = ['What organic spray controls corn earworms?', 'When is the best time to harvest corn?'];
    } else {
      answer = `🌱 **AgriMate Smart Farming Advice:**
1. **Soil Health:** Incorporate 2 inches of compost around plant bases.
2. **Irrigation:** Water deeply at root base between 6:00 AM and 8:30 AM.
3. **Pest Control:** Scout foliage twice weekly to detect pests before economic damage occurs.`;
      followUps = ['Why are my crop leaves turning yellow?', 'What is the best fertilizer for flowering?'];
    }
  }

  return {
    conversation_id: conversationId || `conv_local_${Date.now()}`,
    answer,
    cautions,
    follow_up_suggestions: followUps,
    disclaimer,
  };
}
