"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const supabase_js_1 = require("@supabase/supabase-js");
const config_js_1 = require("../config.js");
let supabaseClient = null;
if (config_js_1.config.supabaseUrl && config_js_1.config.supabaseUrl !== 'https://mock.supabase.co' && config_js_1.config.supabaseAnonKey) {
    try {
        supabaseClient = (0, supabase_js_1.createClient)(config_js_1.config.supabaseUrl, config_js_1.config.supabaseAnonKey);
    }
    catch (err) {
        console.warn('Supabase client initialization skipped:', err);
    }
}
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or malformed Authorization header with Bearer token.',
        });
    }
    const token = authHeader.split(' ')[1];
    // If live Supabase client is available, verify token with Supabase
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.getUser(token);
            if (error || !data.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired session token.',
                });
            }
            req.userId = data.user.id;
            req.userEmail = data.user.email;
            return next();
        }
        catch (err) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Failed to verify session token.',
            });
        }
    }
    // Fallback for local development and offline mock tests:
    // Accept standard test tokens or base64 user IDs safely
    try {
        if (token === 'dev-token-test-user') {
            req.userId = '00000000-0000-0000-0000-000000000001';
            req.userEmail = 'farmer@agrimate.local';
            return next();
        }
        // Try decoding JWT payload to get user id if token format is standard header.payload.sig
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            req.userId = payload.sub || payload.user_id || '00000000-0000-0000-0000-000000000001';
            req.userEmail = payload.email || 'farmer@agrimate.local';
            return next();
        }
        // Default fallback to token string if uuid-like
        req.userId = token.length >= 10 ? token : '00000000-0000-0000-0000-000000000001';
        req.userEmail = 'farmer@agrimate.local';
        return next();
    }
    catch (err) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid session token format.',
        });
    }
}
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.userId = 'guest_farmer';
        req.userEmail = 'guest@agrimate.local';
        return next();
    }
    const token = authHeader.split(' ')[1];
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.auth.getUser(token);
            if (data?.user) {
                req.userId = data.user.id;
                req.userEmail = data.user.email;
                return next();
            }
        }
        catch { }
    }
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            req.userId = payload.sub || payload.user_id || 'guest_farmer';
            req.userEmail = payload.email || 'guest@agrimate.local';
            return next();
        }
        req.userId = token.length >= 10 ? token : 'guest_farmer';
        req.userEmail = 'guest@agrimate.local';
        return next();
    }
    catch {
        req.userId = 'guest_farmer';
        req.userEmail = 'guest@agrimate.local';
        return next();
    }
}
