import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { validateRequest } from '../utils/validation';
import {
  getAccountProfile,
  updateUserProfile,
  upsertDealerProfile
} from '../services/account.service';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  area: z.string().max(80).optional().nullable()
});

const upsertDealerProfileSchema = z.object({
  dealerName: z.string().min(1).max(160),
  address: z.string().min(1).max(255),
  logoUrl: z.string().url().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  area: z.string().max(80).optional().nullable()
});

export const validateUpdateProfile = validateRequest({
  body: updateProfileSchema
});

export const validateUpsertDealerProfile = validateRequest({
  body: upsertDealerProfileSchema
});

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authUser = req.user!;
    const profile = await getAccountProfile(authUser.id);
    return success(res, profile, 'Account profile');
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authUser = req.user!;
    const user = await updateUserProfile(authUser.id, req.body);
    return success(res, user, 'Profile updated');
  }
);

export const upsertDealerProfileController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authUser = req.user!;
    const dealerProfile = await upsertDealerProfile(authUser.id, req.body);
    return success(res, dealerProfile, 'Dealer profile saved');
  }
);

