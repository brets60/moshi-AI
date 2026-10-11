"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soilRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const soilService_js_1 = require("../services/soilService.js");
exports.soilRouter = (0, express_1.Router)();
const soilAssessmentSchema = zod_1.z.object({
    soilType: zod_1.z.enum(['clay', 'sandy', 'loamy', 'silty', 'peaty']),
    soilPh: zod_1.z.number().min(3.0).max(10.0).optional(),
    cropType: zod_1.z.string().min(1, 'Crop type is required'),
    growthStage: zod_1.z.string().optional(),
    hasSoilTestResults: zod_1.z.boolean().optional(),
});
exports.soilRouter.post('/advice', (req, res) => {
    const validation = soilAssessmentSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = (0, soilService_js_1.evaluateSoilAndFertilizer)(validation.data);
    return res.json(result);
});
