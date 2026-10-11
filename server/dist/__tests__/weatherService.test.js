"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const weatherService_js_1 = require("../services/weatherService.js");
describe('Weather Service & Agricultural Advisory', () => {
    test('correctly decodes standard WMO weather codes into plain terminology', () => {
        expect((0, weatherService_js_1.getWeatherDescription)(0)).toBe('Clear sky');
        expect((0, weatherService_js_1.getWeatherDescription)(2)).toBe('Partly cloudy');
        expect((0, weatherService_js_1.getWeatherDescription)(3)).toBe('Overcast');
        expect((0, weatherService_js_1.getWeatherDescription)(61)).toBe('Rain (Slight to Heavy)');
        expect((0, weatherService_js_1.getWeatherDescription)(95)).toBe('Thunderstorm');
    });
});
