"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSoilAndFertilizer = evaluateSoilAndFertilizer;
function evaluateSoilAndFertilizer(input) {
    const crop = input.cropType || 'General Vegetables';
    const ph = input.soilPh;
    // Soil characteristics
    let drainage = '';
    let summary = '';
    switch (input.soilType) {
        case 'clay':
            summary = 'Heavy clay soil: High nutrient retention, but compacts easily and drains slowly.';
            drainage = 'Prone to waterlogging. Avoid tilling or walking on clay when wet. Incorporate well-decomposed organic matter to improve aeration.';
            break;
        case 'sandy':
            summary = 'Light sandy soil: Warms up quickly in spring, but drains very fast and loses nutrients easily through leaching.';
            drainage = 'Fast drainage. Water frequently in smaller quantities. Add thick layers of compost and mulch to boost moisture retention.';
            break;
        case 'loamy':
            summary = 'Loamy soil: Ideal agricultural texture. Excellent balance of drainage, aeration, and nutrient-holding capacity.';
            drainage = 'Well-draining with good moisture retention. Maintain structure with annual top-dressing of organic compost.';
            break;
        case 'silty':
            summary = 'Silty soil: Smooth texture that holds water well and carries good fertility, but can crust easily after hard rains.';
            drainage = 'Moderate drainage. Mulch regularly to prevent surface crusting and soil erosion.';
            break;
        case 'peaty':
            summary = 'Peat soil: High in organic matter, spongy, naturally acidic, and holds ample water.';
            drainage = 'Can remain waterlogged during heavy rains. May require light lime application if too acidic for the intended crop.';
            break;
        default:
            summary = 'Mixed agricultural soil.';
            drainage = 'Maintain organic mulch and monitor root aeration.';
    }
    // pH analysis
    let phStatus = 'Unmeasured';
    let phAdvice = 'A simple soil pH test kit or local extension lab test is strongly recommended before amending your soil.';
    const idealRange = getCropIdealPh(crop);
    if (ph !== undefined && ph !== null && !isNaN(ph)) {
        if (ph < 5.8) {
            phStatus = 'Acidic';
            phAdvice = `At pH ${ph}, nutrient uptake (phosphorus, calcium, magnesium) is restricted. Agricultural limestone (calcium carbonate) or dolomite can gradually raise pH. Do not over-apply; retest before adding more.`;
        }
        else if (ph > 7.5) {
            phStatus = 'Alkaline';
            phAdvice = `At pH ${ph}, micronutrients like iron, manganese, and zinc can become locked. Adding organic matter, sulfur, or composted pine needles helps lower pH naturally.`;
        }
        else {
            phStatus = 'Optimal';
            phAdvice = `At pH ${ph}, most essential plant nutrients remain soluble and readily absorbable by roots.`;
        }
    }
    return {
        soil_type_summary: summary,
        drainage_and_water_holding: drainage,
        ph_analysis: {
            status: phStatus,
            measured_value: ph,
            ideal_range_for_crop: idealRange,
            actionable_advice: phAdvice,
        },
        organic_matter_advice: [
            'Top-dress with 1 to 2 inches of compost twice per year to feed beneficial soil microorganisms.',
            'Maintain an organic mulch cover (clean straw, leaves, or grass clippings) to protect topsoil from sun baking and wind erosion.',
            'Rotate crops with nitrogen-fixing cover crops (cowpeas, clover, or beans) during off-seasons.',
        ],
        fertilizer_guidance: {
            principles: [
                'Test Before You Treat: Adding fertilizer without a soil test can cause nutrient lockout, salt buildup, or polluted runoff.',
                'Split Applications: Feed smaller amounts throughout active growth stages instead of one heavy burst.',
                'Apply to Moist Soil: Never apply granular fertilizers to bone-dry soil; irrigate lightly before and after application to prevent root burn.',
            ],
            macronutrients_overview: {
                nitrogen: 'Nitrogen (N): Promotes leafy vegetative growth. Crucial in early seedling and vegetative stages; reduce during fruiting to avoid excessive foliage.',
                phosphorus: 'Phosphorus (P): Stimulates root establishment, early blooming, and seed development. Work into the root zone before planting.',
                potassium: 'Potassium (K): Boosts disease resistance, stem strength, water regulation, and fruit sweetness.',
            },
            cautions: [
                'Never exceed manufacturer-recommended label dosages for commercial fertilizers.',
                'Wear protective gloves and wash hands after handling fertilizers.',
                'Keep chemical fertilizers stored in sealed, dry containers away from children, livestock, and water sources.',
            ],
        },
        important_disclaimer: 'Smartphone sensors cannot directly measure soil pH or chemical nutrient levels. Reliable fertilizer decisions require physical testing with a calibrated soil probe, chemical test kit, or local agricultural extension laboratory.',
    };
}
function getCropIdealPh(cropName) {
    const c = cropName.toLowerCase();
    if (c.includes('tomato') || c.includes('pepper') || c.includes('eggplant'))
        return '6.0 – 6.8';
    if (c.includes('potato'))
        return '5.0 – 6.0 (prevents potato scab)';
    if (c.includes('corn') || c.includes('maize'))
        return '5.8 – 7.0';
    if (c.includes('cabbage') || c.includes('broccoli') || c.includes('brassica'))
        return '6.5 – 7.5';
    if (c.includes('rice'))
        return '5.5 – 6.5';
    if (c.includes('bean') || c.includes('pea') || c.includes('legume'))
        return '6.0 – 7.0';
    if (c.includes('blueberry'))
        return '4.5 – 5.5 (strictly acid-loving)';
    return '6.0 – 7.0 (suitable for most vegetables and field crops)';
}
