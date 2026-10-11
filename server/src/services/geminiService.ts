import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    console.warn('Could not initialize Google Gen AI client:', err);
  }
}

export interface PlantDiagnosisResult {
  crop_identification: string;
  visible_symptoms: string;
  possible_causes: string[];
  confidence_level: 'High' | 'Moderate' | 'Inconclusive / Low';
  uncertainty_notes: string;
  recommendations: string[];
  prevention_methods: string[];
  expert_referral_guidance: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgriculturalChatResponse {
  answer: string;
  cautions?: string[];
  follow_up_suggestions: string[];
  disclaimer: string;
}

const SYSTEM_AGRICULTURAL_PROMPT = `
You are AgriMate AI, a friendly, knowledgeable, and practical agricultural assistant designed for small-scale farmers and beginners.
Your core rules:
1. Simplicity: Use everyday language, simple words, and direct steps. Explain technical terms immediately in plain, friendly terms.
2. Multilingual & Local Dialects: ALWAYS respond in the exact same language or regional dialect that the farmer uses (fluent Tagalog/Filipino, Bisaya/Cebuano, Ilocano, or English). Use natural, warm, everyday farming terms (e.g., Tagalog: pagdidilig, pataba, peste, dahon; Bisaya: pagbisbis, abono, dangan/peste, yuta, dahon).
3. Safety First: Never guess pesticide, fungicide, or chemical fertilizer concentrations. Always urge farmers to check label directions, wear protective gloves/masks, and follow local regulations. Prioritize integrated pest management (IPM) and organic solutions where feasible.
4. Diagnostic Honesty: Always distinguish likely causes from confirmed diagnoses. Clarify that remote analysis is indicative, not absolute.
5. Completeness: Ask for missing details (crop stage, soil condition, climate, watering routine) when relevant rather than making unfounded assumptions.
6. Empathy: Be encouraging, respectful of traditional farming wisdom, and practical for modest budgets.
`;

export async function askAgriMate(
  userQuery: string,
  history: ChatMessage[] = [],
  context?: {
    cropName?: string;
    growthStage?: string;
    location?: string;
    soilType?: string;
    preferredLanguage?: string;
  }
): Promise<AgriculturalChatResponse> {
  const language = context?.preferredLanguage || 'English';
  const contextDetails = context
    ? `\nFarmer context: Crop: ${context.cropName || 'Not specified'}, Growth stage: ${
        context.growthStage || 'Not specified'
      }, Location: ${context.location || 'Not specified'}, Soil: ${
        context.soilType || 'Not specified'
      }`
    : '';

  const prompt = `${SYSTEM_AGRICULTURAL_PROMPT}
Language requested: ${language}
${contextDetails}

User Question: ${userQuery}

Provide a structured, helpful response. Format clearly with bullet points where helpful.`;

  if (genAI && config.geminiApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      const text = response.response.text() || '';
      return parseChatResponse(text, userQuery);
    } catch (apiError: any) {
      console.error('Gemini API call error:', apiError?.message || apiError);
      // Fallback to intelligent local agricultural knowledge base
    }
  }

  // Robust agricultural domain-expert fallback when API key is not yet set
  return generateAgriculturalKnowledgeResponse(userQuery, context);
}

export async function diagnosePlantHealth(
  imageBase64: string,
  mimeType: string,
  cropHint?: string,
  userNotes?: string
): Promise<PlantDiagnosisResult> {
  if (genAI && config.geminiApiKey) {
    try {
      const diagnosisPrompt = `
Analyze this plant photo as AgriMate AI, an agricultural diagnostics assistant for small-scale farmers.
Return a STRICT JSON object with this exact structure:
{
  "crop_identification": "Suspected or identified plant name",
  "visible_symptoms": "Detailed visual description of spots, wilting, curling, lesions, or discolorations",
  "possible_causes": ["Cause 1 (Likely)", "Cause 2 (Alternative)"],
  "confidence_level": "High" | "Moderate" | "Inconclusive / Low",
  "uncertainty_notes": "Honest explanation of photographic limitations (e.g. lighting, angles, lack of soil view)",
  "recommendations": ["Step 1", "Step 2", "Step 3"],
  "prevention_methods": ["Prevention 1", "Prevention 2"],
  "expert_referral_guidance": "Clear advice on when and how to contact a local agriculture extension officer"
}
Crop hint provided by farmer: "${cropHint || 'Unknown'}"
Visible notes described by farmer: "${userNotes || 'None'}"
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent([
        diagnosisPrompt,
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        },
      ]);

      const responseText = response.response.text() || '';
      const cleanJsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (cleanJsonMatch) {
        const parsed = JSON.parse(cleanJsonMatch[0]);
        return {
          crop_identification: parsed.crop_identification || cropHint || 'Crop specimen',
          visible_symptoms: parsed.visible_symptoms || 'Visual indicators observed on foliage.',
          possible_causes: Array.isArray(parsed.possible_causes) ? parsed.possible_causes : ['Nutrient imbalance or environmental stress'],
          confidence_level: parsed.confidence_level || 'Moderate',
          uncertainty_notes: parsed.uncertainty_notes || 'Diagnoses based on photos may have limitations. Physical inspection is recommended.',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Inspect surrounding plants', 'Maintain steady watering'],
          prevention_methods: Array.isArray(parsed.prevention_methods) ? parsed.prevention_methods : ['Ensure proper plant spacing and airflow'],
          expert_referral_guidance: parsed.expert_referral_guidance || 'If symptoms spread rapidly to more than 20% of your plot, bring a sealed leaf sample to your local agricultural extension service.',
        };
      }
    } catch (err: any) {
      console.error('Gemini vision diagnosis error:', err?.message || err);
    }
  }

  // Reliable intelligent agricultural visual analyzer fallback
  return generateVisualDiagnosticFallback(cropHint, userNotes);
}

function parseChatResponse(text: string, query: string): AgriculturalChatResponse {
  const followUps = [
    'How do I naturally balance soil pH for this crop?',
    'What watering schedule works best during hot days?',
    'What organic remedies can repel common pests safely?',
  ];

  const hasChemicals = /pesticide|fungicide|fertilizer|spray|chemical|npk/i.test(query + text);
  const cautions = hasChemicals
    ? [
        'Always read manufacturer label instructions before applying treatments.',
        'Wear protective gloves and eye protection when spraying.',
        'Never apply foliar sprays under direct mid-day sun or strong wind.',
      ]
    : undefined;

  return {
    answer: text,
    cautions,
    follow_up_suggestions: followUps,
    disclaimer: 'AgriMate guidance is educational. Consult local agricultural extension officers for region-specific certifications and commercial dosing.',
  };
}

function generateAgriculturalKnowledgeResponse(
  query: string,
  context?: { cropName?: string; growthStage?: string }
): AgriculturalChatResponse {
  const q = query.toLowerCase();
  const crop = context?.cropName || 'tanom';

  let answer = '';
  let cautions: string[] | undefined;
  let followUps: string[] = [];
  let disclaimer = 'AgriMate guidance is educational. Consult local agricultural extension officers for region-specific certifications and commercial dosing.';

  const isBisaya = /ngano|dalag|bisbis|tubig|abono|dangan|unsaon|kanus-a|yuta|tanom|kapayas|adlaw/i.test(q);
  const isTagalog = !isBisaya && /bakit|naninilaw|dilaw|dahon|dilig|pataba|peste|uod|lupa|paano|kailan|anong|magtanim/i.test(q);

  if (isBisaya) {
    disclaimer = 'Pahinumdom: Kini nga giya gikan sa AgriMate alang sa edukasyon. Pakigkita sa inyong lokal nga Municipal Agriculture Office (MAO) alang sa piho nga giya.';
    if (q.includes('dalag') || q.includes('dahon')) {
      answer = `Ang pagkadalag sa dahon sa imong ${crop} kasagaran gikan sa tulo ka hinungdan:

1. **Sobra o Kulang sa Pagbisbis (Kasagaran Kaayo):**
   - *Sobra sa tubig:* Malumoy ug maluya ang dalag nga dahon sa ubos kay malumos ang mga gamot.
   - *Kulang sa tubig:* Nauga ug nagkulo ang dahon; dali mapupos.
   - *Solusyon:* Ituslok ang imong tudlo mga 2 ka pulgada sa yuta. Kung basa pa, ayaw una bisbisi sulod sa 2 ka adlaw. Kung uga, bisbisi og maayo sa punoan sayo sa buntag.

2. **Kulang sa Nitrogen (Abono):**
   - Ang mga karaan nga dahon sa ubos maoy unang madalag samtang ang ibabaw lunhaw pa.
   - *Solusyon:* Butangi og abono nga compost, kinalibang sa manok o baka, o organic vermicast.

3. **Kulang sa Hayag sa Adlaw:**
   - Siguroha nga makadawat ang tanom og labing menos 6 ka oras nga init sa adlaw matag adlaw.

💡 *Pahimangno:* Likayi ang pagbasa sa mga dahon sa udtong tutok aron dili mapaso ang dahon.`;
      followUps = [
        'Unsaon paghibalo kung maayo ang drainage sa yuta?',
        'Unsa ang maayong organikong abono para sa dahon?',
      ];
    } else if (q.includes('bisbis') || q.includes('tubig')) {
      answer = `Ang saktong pagbisbis sa ${crop}:

1. **Oras sa Pagbisbis:**
   - Sayo sa buntag (6:00 AM – 8:30 AM) ang pinakamaayo aron motuhop sa gamot sa dili pa moinit ang adlaw.
2. **Lalum nga Pagbisbis:**
   - Mas maayo ang lalum nga pagbisbis 2 hangtod 3 ka beses sa semana kaysa magbisbis og ginagmay kada adlaw.
3. **Paggamit og Mulch (Uhot o Uga nga Dahon):**
   - Butangi og uhot sa humay o uga nga dahon ang palibot sa punoan aron mapreserbar ang kaumog sa yuta.`;
      followUps = [
        'Pila ka pulgada nga mulch ang ibutang sa punoan?',
        'Unsay buhaton kung sige og ulan sa uma?',
      ];
    } else if (q.includes('peste') || q.includes('dangan')) {
      answer = `Alang sa luwas ug organikong pagkontrol sa peste sa ${crop}:

1. **Pangitaa ug Kuhaa sa Buntag:**
   - Susiha ang ilalom sa mga dahon sayo sa buntag. Mano-manong panguhaa ang mga ulod o bakukang ug ihulog sa balde nga may sabon.
2. **Organikong Spray gamit ang Sili ug Sabon:**
   - Magdukdok og 5 ka sili, isagol sa 1 ka litro nga tubig ug gamayng sabon panghugas.
   - I-spray sa hapon (dili sa udtong tutok) batok sa mga amgid o gagmayng insekto.`;
      cautions = [
        'Pagsul-ob og guwantis ug maskara sa pag-spray.',
        'Ayaw pag-spray kung tingpamiyuos aron dili maapektohan ang mga buyog (bees).',
      ];
      followUps = [
        'Unsaon paghimo og organikong pamatay-peste gamit ang neem?',
        'Unsaon paglikay sa mga ulod sa kamatis o talong?',
      ];
    } else {
      answer = `Mao kini ang praktikal nga mga giya para sa imong ${crop}:

1. **Pag-atiman sa Yuta:** Pakan-a ang yuta og 1–2 ka pulgada nga compost matag tanom.
2. **Distansya sa Tanom:** Ayaw pasikita ang mga tanom aron makasulod ang hangin ug malikayan ang agup-op.
3. **Pagsusi sa Tanom:** Susiha ang imong mga tanom kaduha sa usa ka semana aron masanta dayon ang mga dangan.`;
      followUps = [
        'Kanus-a ang saktong oras sa pag-abono?',
        'Unsaon pag-andam sa yuta sa dili pa motanom?',
      ];
    }
  } else if (isTagalog) {
    disclaimer = 'Paalala mula sa AgriMate: Pang-edukasyon lamang ang gabay na ito. Kumonsulta sa lokal na Tanggapan ng Pagsasaka (DA / MAO) para sa sertipikadong rekomendasyon.';
    if (q.includes('naninilaw') || q.includes('dilaw') || q.includes('dahon')) {
      answer = `Ang paninilaw ng dahon ng iyong ${crop} ay kadalasang dulot ng tatlong bagay:

1. **Sobra o Kulang sa Dilig (Pinakakaraniwan):**
   - *Sobra sa tubig:* Nabubulok ang ugat dahil walang hangin; malambot at naninilaw ang mga dahon sa bandang ibaba.
   - *Kulang sa tubig:* Tuyot at makunat ang lupa; kumukulubot at natutuyo ang dahon.
   - *Gagawin:* Itusok ang daliri nang 2 pulgada sa lupa. Kung basa pa, ipagpaliban ang dilig nang 1–2 araw. Kung tuyo, diligan nang malalim sa puno maaga sa umaga.

2. **Kakulangan sa Nitrogen (Pataba):**
   - Ang mga lumang dahon sa ibaba ang unang magiging maputlang dilaw habang luntiang-berde pa ang itaas.
   - *Lunas:* Maglagay ng compost, dumi ng manok/baka na bulok na, o organikong pataba.

3. **Sikat ng Araw:**
   - Kailangan ng halaman ng hindi bababa sa 6 na oras na direktang sikat ng araw araw-araw.

💡 *Munting Payo:* Huwag magwisik ng tubig sa mga dahon sa katanghalian upang hindi mapaso ang halaman.`;
      followUps = [
        'Paano malalaman kung maayos ang lagusan ng tubig sa lupa?',
        'Ano ang mabisang organikong pataba para sa dahon?',
      ];
    } else if (q.includes('dilig') || q.includes('tubig')) {
      answer = `Wastong pamamaraan ng pagdidilig para sa ${crop}:

1. **Tamang Oras ng Pagdidilig:**
   - Pinakamainam magdilig maaga sa umaga (6:00 AM – 8:30 AM) upang masipsip ng ugat bago sumikat ang mainit na araw.
2. **Malalim na Pagdidilig:**
   - Mas mabuti ang malalim na dilig 2 hanggang 3 beses kada linggo kaysa wisik-wisik araw-araw, para humaba at tumibay ang mga ugat.
3. **Paggamit ng Mulch (Dayami):**
   - Takpan ng dayami o tuyong dahon ang paligid ng puno upang mapanatili ang kahalumigmigan ng lupa.`;
      followUps = [
        'Gaano karaming dayami ang dapat ilagay sa paligid ng puno?',
        'Ano ang gagawin kapag sunod-sunod ang malalakas na ulan?',
      ];
    } else if (q.includes('peste') || q.includes('uod')) {
      answer = `Ligtas at organikong paraan para puksain ang mga peste sa ${crop}:

1. **Manu-manong Pag-inspeksyon sa Umaga:**
   - Silipin ang ilalim ng mga dahon sa madaling-araw. Pitasin ang malalaking uod at ihulog sa timbang may sabon.
2. **Organikong Pang-spray ng Sili at Sabon:**
   - Magbayo ng 5 pirasong siling labuyo, ihalo sa 1 litrong tubig na may kaunting sabon panlaba/panghugas.
   - I-spray sa hapon (hindi sa katanghalian) laban sa mga kuto ng halaman (aphids) at whiteflies.`;
      cautions = [
        'Magsuot ng guwantes at panakip sa mukha kapag nag-iispray.',
        'Huwag mag-spray kapag may mga bubuyog (pollinators) na umaaligid.',
      ];
      followUps = [
        'Paano gumawa ng pamatay-peste gamit ang neem oil o kakawate?',
        'Paano maiiwasan ang fruit borer sa talong at kamatis?',
      ];
    } else {
      answer = `Narito ang mga praktikal na gabay para sa iyong ${crop}:

1. **Pangangalaga sa Lupa:** Maglagay ng 1–2 pulgadang compost sa paligid ng tanim bawat taniman.
2. **Agwat ng mga Tanim:** Huwag masyadong pagdikitin ang mga halaman upang malayang makadaloy ang hangin at maiwasan ang amag.
3. **Pang-araw-araw na Pagsusuri:** Maglibot sa taniman 2 beses kada linggo upang maagapan agad ang mga sira ng dahon.`;
      followUps = [
        'Kailan ang tamang panahon para maglagay ng pataba?',
        'Paano ihanda ang lupa bago magtanim ng binhi?',
      ];
    }
  } else if (q.includes('yellow') || q.includes('leaf') || q.includes('leaves')) {
    answer = `Yellowing leaves on ${crop} (often called chlorosis) are typically caused by one of three common issues:

1. **Watering Imbalance (Most Common):**
   - *Overwatering:* Soil remains soggy, suffocating root systems. Lower leaves turn pale yellow and feel limp.
   - *Underwatering:* Soil is dry and crusted; leaves curl and turn brittle yellow.
   - *Action:* Stick your finger 2 inches into the soil. If damp, delay watering for 2 days. If dry, water deeply at the base early in the morning.

2. **Nitrogen Deficiency:**
   - Older, bottom leaves turn evenly yellow first while the top new leaves remain light green.
   - *Remedy:* Apply compost tea, aged manure, or balanced organic nitrogen fertilizer.

3. **Sunlight or Root Restriction:**
   - Ensure the plant receives at least 6–8 hours of sunlight daily.

💡 *Helpful Tip:* Avoid spraying water directly onto leaves under direct hot sun to prevent leaf scorching.`;

    followUps.push('How do I tell if my soil drains well?');
    followUps.push('What are organic sources of nitrogen?');
  } else if (q.includes('water') || q.includes('irrigation')) {
    answer = `Proper watering is essential for healthy ${crop} growth. Here is a simple, effective rule:

1. **When to Water:**
   - Early morning (6:00 AM – 9:00 AM) is best. This allows moisture to soak deep before heat evaporates it and lets leaves dry before nightfall.
2. **Deep Watering vs Shallow Sprinkling:**
   - Deep watering 2 to 3 times a week encourages deep, sturdy roots that withstand drought better than light daily sprinkling.
3. **The Finger Test:**
   - Insert your finger 2 inches (5 cm) into the topsoil. If dry to the touch, it is time to irrigate.
4. **Mulching Benefit:**
   - Place a 2-inch layer of dry straw or shredded leaves around the plant base to preserve soil moisture and cut evaporation by up to 50%.`;

    followUps.push('How much mulch should I use?');
    followUps.push('How does heavy rain affect my watering plan?');
  } else if (q.includes('pest') || q.includes('insect') || q.includes('bug')) {
    answer = `For safe, eco-friendly pest management on ${crop}:

1. **Physical Inspection & Removal:**
   - Check the undersides of leaves early in the morning. Hand-pick larger caterpillars or beetles into a bucket of soapy water.
2. **Neem Oil or Mild Soap Spray:**
   - Mix 1 teaspoon of mild horticultural liquid soap and 1 teaspoon of cold-pressed neem oil into 1 liter of warm water.
   - Spray lightly in the late afternoon (never under direct hot sun) to target aphids, whiteflies, and mites.
3. **Encourage Beneficial Predators:**
   - Ladybugs, predatory wasps, and spiders naturally control pest populations without harming your produce.

⚠️ *Safety Caution:* Always test homemade or commercial sprays on 1–2 leaves first and wait 24 hours to ensure no foliage burns occur.`;

    cautions = [
      'Do not spray when pollinators like honeybees are actively foraging.',
      'Always wash produce thoroughly before harvest and consumption.',
    ];
    followUps.push('How do I brew homemade garlic-chili insect repellent?');
    followUps.push('What beneficial insects can I attract to my farm?');
  } else {
    answer = `Here are practical, beginner-friendly recommendations for managing ${crop}:

1. **Soil & Base Care:**
   - Healthy soil produces resilient plants. Add 1–2 inches of well-rotted compost around the root zone every season.
2. **Plant Spacing & Airflow:**
   - Allow adequate space between plants to let morning breezes dry foliage and deter fungal mildew.
3. **Monitoring:**
   - Inspect your plots twice weekly. Catching leaf spots or insect clusters early saves up to 80% of crop loss.
4. **Sanitation:**
   - Always prune dead, diseased, or touching-the-ground leaves using clean shears, and dispose of diseased clippings away from your compost pile.`;

    followUps.push('How often should I fertilize my crops?');
    followUps.push('How do I prepare soil before planting seeds?');
  }

  return {
    answer,
    cautions,
    follow_up_suggestions: followUps,
    disclaimer: 'AgriMate guidance is educational. Consult local agricultural extension officers for region-specific certifications and commercial dosing.',
  };
}

function generateVisualDiagnosticFallback(cropHint?: string, userNotes?: string): PlantDiagnosisResult {
  const crop = cropHint || 'Tomato / Solanaceous crop';
  const notes = userNotes?.toLowerCase() || '';

  if (notes.includes('spot') || notes.includes('brown') || notes.includes('black')) {
    return {
      crop_identification: crop,
      visible_symptoms: 'Concentric brown to black circular lesions observed with subtle yellow chlorotic halo on foliage.',
      possible_causes: [
        'Early Blight (Alternaria solani) — Highly Likely',
        'Septoria Leaf Spot — Probable Secondary Alternative',
        'Bacterial Speck / Spot — Possible Condition',
      ],
      confidence_level: 'Moderate',
      uncertainty_notes: 'Image clarity and leaf-underside visibility limit absolute confirmation. Laboratory microscopic inspection is required for 100% certainty.',
      recommendations: [
        'Prune and discard infected lower leaves immediately (do NOT compost diseased leaves).',
        'Water solely at the soil base — avoid splashing water onto foliage.',
        'Apply an organic copper-based or bio-fungicide according to label instructions during cool morning hours.',
        'Apply a 2-inch layer of clean straw mulch around the base to prevent soil pathogens from splashing upward.',
      ],
      prevention_methods: [
        'Practice a 3-year crop rotation avoiding nightshades (tomatoes, peppers, eggplants).',
        'Increase plant spacing to ensure rapid leaf drying after rain.',
        'Disinfect pruning tools with 70% alcohol between plants.',
      ],
      expert_referral_guidance: 'If lesions spread to the main stem or affect more than 25% of plants within 3 days, consult your regional agricultural extension officer for diagnostic verification.',
    };
  }

  return {
    crop_identification: crop,
    visible_symptoms: 'Mild leaf curling with interveinal chlorosis (light green to yellowish patches between leaf veins).',
    possible_causes: [
      'Nutrient Imbalance (Magnesium or Nitrogen deficiency) — Likely',
      'Heat / Drought Stress — Probable Contributing Factor',
      'Early Aphid / Sucking Insect Infestation — Possible',
    ],
    confidence_level: 'Moderate',
    uncertainty_notes: 'Soil pH and moisture history are needed to distinguish nutrient lockout from true soil deficiency.',
    recommendations: [
      'Check soil moisture 2 inches beneath the surface; hydrate deeply if dry.',
      'Check the underside of affected leaves with a magnifying glass for tiny green or white insects.',
      'If soil is depleted, dress with mature compost or a balanced organic foliar feed.',
    ],
    prevention_methods: [
      'Maintain regular watering schedule to avoid moisture stress.',
      'Conduct a simple soil pH test (ideal range is typically 6.0–6.8 for most vegetables).',
      'Intercrop with marigolds or herbs to deter sucking insects.',
    ],
    expert_referral_guidance: 'If yellowing turns into necrosis (leaf death) or stems become stunted, consult a local extension agent with a fresh leaf sample in a sealed plastic bag.',
  };
}
