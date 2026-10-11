import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const userRouter = Router();

// In-memory profile & settings stores
const profiles: Record<string, any> = {};
const userSettings: Record<string, any> = {};

// GET Profile
userRouter.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const profile = profiles[req.userId!] || {
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
userRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const existing = profiles[req.userId!] || { id: req.userId };
  profiles[req.userId!] = {
    ...existing,
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  return res.json(profiles[req.userId!]);
});

// GET Settings
userRouter.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const settings = userSettings[req.userId!] || {
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
userRouter.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const existing = userSettings[req.userId!] || { user_id: req.userId };
  userSettings[req.userId!] = {
    ...existing,
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  return res.json(userSettings[req.userId!]);
});

// GET Data Export (Privacy & GDPR compliance)
userRouter.get('/export', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const exportPayload = {
    user_id: req.userId,
    exported_at: new Date().toISOString(),
    profile: profiles[req.userId!] || null,
    settings: userSettings[req.userId!] || null,
    format: 'AgriMate-Data-Export-v1',
  };
  return res.json(exportPayload);
});

// DELETE Account & All Associated Data
userRouter.delete('/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  delete profiles[req.userId!];
  delete userSettings[req.userId!];
  return res.json({
    message: 'User account and all farming records have been securely deleted.',
    user_id: req.userId,
  });
});
