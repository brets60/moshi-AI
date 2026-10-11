"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cropsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
exports.cropsRouter = (0, express_1.Router)();
const cropSchema = zod_1.z.object({
    crop_name: zod_1.z.string().min(1, 'Crop name is required'),
    variety: zod_1.z.string().optional(),
    farm_id: zod_1.z.string().optional(),
    farm_name: zod_1.z.string().optional(),
    planting_date: zod_1.z.string().optional(),
    expected_harvest_date: zod_1.z.string().optional(),
    plot_size: zod_1.z.number().positive().optional(),
    plot_size_unit: zod_1.z.enum(['acres', 'hectares', 'sq_meters', 'plots']).default('acres'),
    growth_stage: zod_1.z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity / Harvest']).default('Seedling'),
    status: zod_1.z.enum(['Active', 'Harvested', 'Archived']).default('Active'),
    notes: zod_1.z.string().optional(),
});
// In-memory crops store
let inMemoryCrops = [];
// GET all crops for user
exports.cropsRouter.get('/', auth_js_1.requireAuth, (req, res) => {
    const statusFilter = req.query.status;
    let crops = inMemoryCrops.filter((c) => c.user_id === req.userId);
    if (statusFilter) {
        crops = crops.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return res.json(crops);
});
// GET single crop
exports.cropsRouter.get('/:id', auth_js_1.requireAuth, (req, res) => {
    const crop = inMemoryCrops.find((c) => c.id === req.params.id && c.user_id === req.userId);
    if (!crop) {
        return res.status(404).json({ error: 'Crop not found.' });
    }
    return res.json(crop);
});
// POST create crop
exports.cropsRouter.post('/', auth_js_1.requireAuth, (req, res) => {
    const validation = cropSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const newCrop = {
        id: `crop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: req.userId,
        ...validation.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    inMemoryCrops.unshift(newCrop);
    return res.status(201).json(newCrop);
});
// PUT update crop
exports.cropsRouter.put('/:id', auth_js_1.requireAuth, (req, res) => {
    const index = inMemoryCrops.findIndex((c) => c.id === req.params.id && c.user_id === req.userId);
    if (index === -1) {
        return res.status(404).json({ error: 'Crop not found or unauthorized.' });
    }
    const validation = cropSchema.partial().safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    inMemoryCrops[index] = {
        ...inMemoryCrops[index],
        ...validation.data,
        updated_at: new Date().toISOString(),
    };
    return res.json(inMemoryCrops[index]);
});
// DELETE crop
exports.cropsRouter.delete('/:id', auth_js_1.requireAuth, (req, res) => {
    const index = inMemoryCrops.findIndex((c) => c.id === req.params.id && c.user_id === req.userId);
    if (index === -1) {
        return res.status(404).json({ error: 'Crop not found or unauthorized.' });
    }
    inMemoryCrops.splice(index, 1);
    return res.json({ message: 'Crop deleted successfully.', id: req.params.id });
});
