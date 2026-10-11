"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_js_1 = require("../middleware/auth.js");
const geminiService_js_1 = require("../services/geminiService.js");
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    storage: multer_1.default.memoryStorage(),
});
exports.aiRouter = (0, express_1.Router)();
// In-memory store for development/testing persistence if database is not connected
const inMemoryAnalyses = [];
const inMemoryConversations = [];
const inMemoryMessages = [];
// Chat with AgriMate
exports.aiRouter.post('/chat', auth_js_1.requireAuth, async (req, res) => {
    try {
        const { message, conversation_id, context } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message text is required.' });
        }
        const convId = conversation_id || `conv_${Date.now()}`;
        const result = await (0, geminiService_js_1.askAgriMate)(message, [], context);
        // Save message record
        inMemoryMessages.push({ id: `msg_${Date.now()}_u`, conversation_id: convId, role: 'user', content: message, created_at: new Date().toISOString() }, { id: `msg_${Date.now()}_a`, conversation_id: convId, role: 'assistant', content: result.answer, created_at: new Date().toISOString() });
        return res.json({
            conversation_id: convId,
            answer: result.answer,
            cautions: result.cautions,
            follow_up_suggestions: result.follow_up_suggestions,
            disclaimer: result.disclaimer,
        });
    }
    catch (err) {
        console.error('AI Chat endpoint error:', err);
        return res.status(500).json({ error: 'Failed to process AI chat query.' });
    }
});
// Plant Doctor Diagnosis (Supports multipart image upload or JSON with base64)
exports.aiRouter.post('/diagnose', auth_js_1.requireAuth, upload.single('image'), async (req, res) => {
    try {
        let imageBase64 = '';
        let mimeType = 'image/jpeg';
        const cropHint = req.body.crop_hint || req.body.cropHint;
        const userNotes = req.body.symptoms || req.body.userNotes;
        if (req.file) {
            imageBase64 = req.file.buffer.toString('base64');
            mimeType = req.file.mimetype;
        }
        else if (req.body.imageBase64) {
            imageBase64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
            mimeType = req.body.mimeType || 'image/jpeg';
        }
        if (!imageBase64) {
            return res.status(400).json({ error: 'A plant photo is required for diagnosis.' });
        }
        const diagnosis = await (0, geminiService_js_1.diagnosePlantHealth)(imageBase64, mimeType, cropHint, userNotes);
        const record = {
            id: `analysis_${Date.now()}`,
            user_id: req.userId,
            crop_id: req.body.crop_id || null,
            crop_identification: diagnosis.crop_identification,
            symptoms: diagnosis.visible_symptoms,
            possible_causes: diagnosis.possible_causes,
            confidence_level: diagnosis.confidence_level,
            uncertainty_notes: diagnosis.uncertainty_notes,
            recommendations: diagnosis.recommendations,
            prevention_methods: diagnosis.prevention_methods,
            expert_referral_guidance: diagnosis.expert_referral_guidance,
            created_at: new Date().toISOString(),
        };
        inMemoryAnalyses.unshift(record);
        return res.status(201).json(record);
    }
    catch (err) {
        console.error('Plant Doctor endpoint error:', err);
        return res.status(500).json({ error: 'Failed to complete plant diagnosis.' });
    }
});
// Get User's Past Plant Analyses
exports.aiRouter.get('/analyses', auth_js_1.requireAuth, (req, res) => {
    const userAnalyses = inMemoryAnalyses.filter((a) => a.user_id === req.userId);
    return res.json(userAnalyses);
});
// Get Single Plant Analysis Details
exports.aiRouter.get('/analyses/:id', auth_js_1.requireAuth, (req, res) => {
    const analysis = inMemoryAnalyses.find((a) => a.id === req.params.id);
    if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found.' });
    }
    return res.json(analysis);
});
