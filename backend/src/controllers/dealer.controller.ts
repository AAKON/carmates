import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { getPublicDealer } from '../services/dealer.service';

export const getDealerPublic = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { dealerId } = req.params;
    const dealer = await getPublicDealer(dealerId);
    return success(res, dealer, 'Dealer');
  }
);

