"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
exports.userRouter = (0, express_1.Router)();
// In-memory profile & settings stores
const profiles = {};
const userSettings = {};
// GET Profile
exports.userRouter.get('/profile', auth_js_1.requireAuth, (req, res) => {
    const profile = profiles[req.userId] || {
        id: req.userId,
        full_name: 'Farmer John',
        email: req.userEmail || 'farmer@agrimate.local',
        preferred_language: 'en',
        farm_name: 'Green Horizon Farm',
        farm_location: 'Central Valley',
        created_at: new Date().toISOString(),
    };
    return res.json(profile);
});
// PUT Profile
exports.userRouter.put('/profile', auth_js_1.requireAuth, (req, res) => {
    const existing = profiles[req.userId] || { id: req.userId };
    profiles[req.userId] = {
        ...existing,
        ...req.body,
        updated_at: new Date().toISOString(),
    };
    return res.json(profiles[req.userId]);
});
// GET Settings
exports.userRouter.get('/settings', auth_js_1.requireAuth, (req, res) => {
    const settings = userSettings[req.userId] || {
        user_id: req.userId,
        theme: 'light',
        preferred_language: 'en',
        notifications_enabled: true,
        weather_location_preference: {
            location_name: 'Farm Location',
            latitude: 37.7749,
            longitude: -122.4194,
        },
    };
    return res.json(settings);
});
// PUT Settings
exports.userRouter.put('/settings', auth_js_1.requireAuth, (req, res) => {
    const existing = userSettings[req.userId] || { user_id: req.userId };
    userSettings[req.userId] = {
        ...existing,
        ...req.body,
        updated_at: new Date().toISOString(),
    };
    return res.json(userSettings[req.userId]);
});
// GET Data Export (Privacy & GDPR compliance)
exports.userRouter.get('/export', auth_js_1.requireAuth, (req, res) => {
    const exportPayload = {
        user_id: req.userId,
        exported_at: new Date().toISOString(),
        profile: profiles[req.userId] || null,
        settings: userSettings[req.userId] || null,
        format: 'AgriMate-Data-Export-v1',
    };
    return res.json(exportPayload);
});
// DELETE Account & All Associated Data
exports.userRouter.delete('/account', auth_js_1.requireAuth, (req, res) => {
    delete profiles[req.userId];
    delete userSettings[req.userId];
    return res.json({
        message: 'User account and all farming records have been securely deleted.',
        user_id: req.userId,
    });
});
