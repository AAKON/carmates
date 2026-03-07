import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { getAdminDashboardCounts } from '../services/adminDashboard.service';

export const getDashboardHandler = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const data = await getAdminDashboardCounts();
    return success(res, data, 'Dashboard');
  }
);

