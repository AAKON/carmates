import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import {
  blockUser,
  listUsersForAdmin,
  unblockUser
} from '../services/adminUser.service';

export const listUsersHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await listUsersForAdmin(req.query);
    return success(res, result, 'Users');
  }
);

export const blockUserHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await blockUser(req.params.id);
    return success(res, user, 'User blocked');
  }
);

export const unblockUserHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await unblockUser(req.params.id);
    return success(res, user, 'User unblocked');
  }
);

