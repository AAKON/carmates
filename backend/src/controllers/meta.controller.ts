import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { validateRequest } from '../utils/validation';
import { listMakes, listModelsByMake } from '../services/meta.service';

const modelsQuerySchema = z.object({
  makeId: z.string().min(1)
});

export const validateModelsQuery = validateRequest({
  query: modelsQuerySchema
});

export const getMakes = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const makes = await listMakes();
    return success(res, makes, 'Makes');
  }
);

export const getModels = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { makeId } = req.query as { makeId: string };
    const models = await listModelsByMake(makeId);
    return success(res, models, 'Models');
  }
);

