import { Router, Request, Response } from 'express';
import { fetchLiveWeather, searchLocations } from '../services/weatherService.js';

export const weatherRouter = Router();

// GET Live Weather
weatherRouter.get('/', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 37.7749;
    const lon = parseFloat(req.query.lon as string) || -122.4194;
    const locationName = (req.query.location_name as string) || 'Farm Location';

    const weather = await fetchLiveWeather(lat, lon, locationName);
    return res.json(weather);
  } catch (err: any) {
    console.error('Weather API error:', err);
    return res.status(502).json({
      error: 'Weather service unavailable',
      message: 'Could not fetch live weather from provider. Please check internet connection or retry shortly.',
    });
  }
});

// GET Search Locations (Geocoding)
weatherRouter.get('/geocode', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || '';
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const results = await searchLocations(query);
    return res.json(results);
  } catch (err: any) {
    console.error('Geocoding search error:', err);
    return res.status(500).json({ error: 'Failed to search locations.' });
  }
});
