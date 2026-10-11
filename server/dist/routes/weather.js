"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherRouter = void 0;
const express_1 = require("express");
const weatherService_js_1 = require("../services/weatherService.js");
exports.weatherRouter = (0, express_1.Router)();
// GET Live Weather
exports.weatherRouter.get('/', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat) || 37.7749;
        const lon = parseFloat(req.query.lon) || -122.4194;
        const locationName = req.query.location_name || 'Farm Location';
        const weather = await (0, weatherService_js_1.fetchLiveWeather)(lat, lon, locationName);
        return res.json(weather);
    }
    catch (err) {
        console.error('Weather API error:', err);
        return res.status(502).json({
            error: 'Weather service unavailable',
            message: 'Could not fetch live weather from provider. Please check internet connection or retry shortly.',
        });
    }
});
// GET Search Locations (Geocoding)
exports.weatherRouter.get('/geocode', async (req, res) => {
    try {
        const query = req.query.query || '';
        if (!query || query.trim().length < 2) {
            return res.json([]);
        }
        const results = await (0, weatherService_js_1.searchLocations)(query);
        return res.json(results);
    }
    catch (err) {
        console.error('Geocoding search error:', err);
        return res.status(500).json({ error: 'Failed to search locations.' });
    }
});
