import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { evaluateSoilAndFertilizer } from '../services/soilService.js';

export const soilRouter = Router();

const soilAssessmentSchema = z.object({
  soilType: z.enum(['clay', 'sandy', 'loamy', 'silty', 'peaty']),
  soilPh: z.number().min(3.0).max(10.0).optional(),
  cropType: z.string().min(1, 'Crop type is required'),
  growthStage: z.string().optional(),
  hasSoilTestResults: z.boolean().optional(),
});

soilRouter.post('/advice', (req: Request, res: Response) => {
  const validation = soilAssessmentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
  }

  const result = evaluateSoilAndFertilizer(validation.data);
  return res.json(result);
});
