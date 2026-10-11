import { getWeatherDescription } from '../services/weatherService.js';

describe('Weather Service & Agricultural Advisory', () => {
  test('correctly decodes standard WMO weather codes into plain terminology', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
    expect(getWeatherDescription(2)).toBe('Partly cloudy');
    expect(getWeatherDescription(3)).toBe('Overcast');
    expect(getWeatherDescription(61)).toBe('Rain (Slight to Heavy)');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });
});
