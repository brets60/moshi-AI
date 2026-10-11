"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherDescription = getWeatherDescription;
exports.fetchLiveWeather = fetchLiveWeather;
exports.searchLocations = searchLocations;
function getWeatherDescription(code) {
    switch (code) {
        case 0:
            return 'Clear sky';
        case 1:
            return 'Mainly clear';
        case 2:
            return 'Partly cloudy';
        case 3:
            return 'Overcast';
        case 45:
        case 48:
            return 'Fog / Rime fog';
        case 51:
        case 53:
        case 55:
            return 'Drizzle (Light to Dense)';
        case 61:
        case 63:
        case 65:
            return 'Rain (Slight to Heavy)';
        case 71:
        case 73:
        case 75:
            return 'Snow fall';
        case 80:
        case 81:
        case 82:
            return 'Rain showers';
        case 95:
            return 'Thunderstorm';
        case 96:
        case 99:
            return 'Thunderstorm with hail';
        default:
            return 'Variable conditions';
    }
}
async function fetchLiveWeather(latitude, longitude, locationName = 'My Farm') {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather service responded with status ${response.status}`);
    }
    const data = await response.json();
    const current = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};
    // Construct short-term hourly forecast (next 12 hours)
    const hourlyList = [];
    const nowIndex = 0;
    const maxHours = Math.min(12, (hourly.time || []).length);
    for (let i = nowIndex; i < maxHours; i++) {
        hourlyList.push({
            time: hourly.time[i] || '',
            temperature: hourly.temperature_2m[i] ?? 0,
            precipitation_probability: hourly.precipitation_probability ? hourly.precipitation_probability[i] ?? 0 : 0,
            weather_code: hourly.weather_code[i] ?? 0,
        });
    }
    // Construct daily 5-day forecast
    const dailyList = [];
    const maxDays = Math.min(5, (daily.time || []).length);
    for (let d = 0; d < maxDays; d++) {
        const code = daily.weather_code[d] ?? 0;
        dailyList.push({
            date: daily.time[d] || '',
            temp_max: daily.temperature_2m_max[d] ?? 0,
            temp_min: daily.temperature_2m_min[d] ?? 0,
            precipitation_sum: daily.precipitation_sum[d] ?? 0,
            precipitation_probability_max: daily.precipitation_probability_max ? daily.precipitation_probability_max[d] ?? 0 : 0,
            wind_speed_max: daily.wind_speed_10m_max[d] ?? 0,
            weather_code: code,
            weather_description: getWeatherDescription(code),
        });
    }
    const temp = current.temperature_2m ?? 24;
    const humidity = current.relative_humidity_2m ?? 60;
    const windSpeed = current.wind_speed_10m ?? 8;
    const rainToday = dailyList[0]?.precipitation_sum ?? 0;
    const rainProb = dailyList[0]?.precipitation_probability_max ?? 0;
    // Farming advisory logic
    let irrigationAdvice = 'Normal watering recommended based on topsoil moisture.';
    if (rainProb >= 60 || rainToday > 5) {
        irrigationAdvice = `Hold off watering today: ${rainProb}% chance of rain (${rainToday} mm forecast). Save water and prevent soil saturation.`;
    }
    else if (temp > 32 && humidity < 40) {
        irrigationAdvice = 'High evaporation risk: irrigate early morning before 8 AM or after 5 PM to minimize water loss.';
    }
    let sprayingSuitability = 'Favorable';
    let sprayingAdvice = 'Calm winds and clear skies make this a safe spraying window.';
    if (windSpeed > 15) {
        sprayingSuitability = 'Unfavorable';
        sprayingAdvice = `Wind speed is ${windSpeed} km/h (too high). Spray drift risk to non-target areas; postpone foliar applications.`;
    }
    else if (rainProb > 40) {
        sprayingSuitability = 'Caution';
        sprayingAdvice = 'Rain forecast may wash away applied foliar sprays before absorption.';
    }
    let fieldworkSuitability = 'Favorable';
    if (rainToday > 15) {
        fieldworkSuitability = 'Unfavorable';
    }
    let temperatureAlert;
    if (temp > 35) {
        temperatureAlert = 'Heat stress warning: Provide shade netting for tender greens and check soil moisture frequently.';
    }
    else if (temp < 4) {
        temperatureAlert = 'Frost alert: Cover frost-sensitive seedlings with row covers or plastic sheets tonight.';
    }
    return {
        location_name: locationName,
        latitude,
        longitude,
        fetched_at: new Date().toISOString(),
        current: {
            temperature: temp,
            apparent_temperature: current.apparent_temperature ?? temp,
            relative_humidity: humidity,
            precipitation: current.precipitation ?? 0,
            precipitation_probability: rainProb,
            wind_speed: windSpeed,
            wind_direction: current.wind_direction_10m ?? 0,
            weather_code: current.weather_code ?? 0,
            weather_description: getWeatherDescription(current.weather_code ?? 0),
        },
        hourly_forecast: hourlyList,
        daily_forecast: dailyList,
        farming_advisory: {
            irrigation_advice: irrigationAdvice,
            spraying_suitability: sprayingSuitability,
            spraying_advice: sprayingAdvice,
            fieldwork_suitability: fieldworkSuitability,
            temperature_alert: temperatureAlert,
        },
    };
}
async function searchLocations(query) {
    if (!query || query.trim().length < 2)
        return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok)
        return [];
    const data = await response.json();
    return (data.results || []).map((item) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || '',
        admin1: item.admin1 || '',
    }));
}
