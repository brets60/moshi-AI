"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const soilService_js_1 = require("../services/soilService.js");
describe('Soil and Fertilizer Guidance Module', () => {
    test('evaluates acidic soil and detects phosphorus lockout risk', () => {
        const result = (0, soilService_js_1.evaluateSoilAndFertilizer)({
            soilType: 'clay',
            soilPh: 5.2,
            cropType: 'Tomato',
        });
        expect(result.soil_type_summary).toContain('Heavy clay soil');
        expect(result.ph_analysis.status).toBe('Acidic');
        expect(result.ph_analysis.actionable_advice).toContain('limestone');
        expect(result.important_disclaimer).toContain('Smartphone sensors cannot directly measure soil pH');
    });
    test('evaluates sandy soil drainage and provides tailored organic mulch guidance', () => {
        const result = (0, soilService_js_1.evaluateSoilAndFertilizer)({
            soilType: 'sandy',
            cropType: 'Maize',
        });
        expect(result.soil_type_summary).toContain('sandy soil');
        expect(result.drainage_and_water_holding).toContain('Fast drainage');
        expect(result.fertilizer_guidance.principles).toHaveLength(3);
    });
});
