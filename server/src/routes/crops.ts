import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const cropsRouter = Router();

const cropSchema = z.object({
  crop_name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional(),
  farm_id: z.string().optional(),
  farm_name: z.string().optional(),
  planting_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  plot_size: z.number().positive().optional(),
  plot_size_unit: z.enum(['acres', 'hectares', 'sq_meters', 'plots']).default('acres'),
  growth_stage: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity / Harvest']).default('Seedling'),
  status: z.enum(['Active', 'Harvested', 'Archived']).default('Active'),
  notes: z.string().optional(),
});

// In-memory crops store
let inMemoryCrops: any[] = [];

// GET all crops for user
cropsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const statusFilter = req.query.status as string;
  let crops = inMemoryCrops.filter((c) => c.user_id === req.userId);

  if (statusFilter) {
    crops = crops.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
  }

  return res.json(crops);
});

// GET single crop
cropsRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const crop = inMemoryCrops.find((c) => c.id === req.params.id && c.user_id === req.userId);
  if (!crop) {
    return res.status(404).json({ error: 'Crop not found.' });
  }
  return res.json(crop);
});

// POST create crop
cropsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
cropsRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
cropsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = inMemoryCrops.findIndex((c) => c.id === req.params.id && c.user_id === req.userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Crop not found or unauthorized.' });
  }

  inMemoryCrops.splice(index, 1);
  return res.json({ message: 'Crop deleted successfully.', id: req.params.id });
});
