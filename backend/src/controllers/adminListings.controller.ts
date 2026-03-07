import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { validateRequest } from '../utils/validation';
import {
  approveListing,
  deleteListing,
  getListingByIdForAdmin,
  listAdminListings,
  listPendingListings,
  rejectListing,
  updateListingStatusByAdmin
} from '../services/adminListing.service';
import type { ListingStatus } from '../models/Listing';

const rejectSchema = z.object({
  reason: z.string().min(1).max(1000)
});

const statusSchema = z.object({
  status: z.enum(['pending', 'live', 'paused', 'sold', 'rejected'])
});

export const validateReject = validateRequest({ body: rejectSchema });

export const validateStatus = validateRequest({ body: statusSchema });

export const getPendingListingsHandler = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const items = await listPendingListings();
    return success(res, items, 'Pending listings');
  }
);

export const getListingsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const status = (req.query.status as string) || 'all';
    const result = await listAdminListings({
      status,
      page: req.query.page,
      limit: req.query.limit
    });
    return success(res, result, 'Listings');
  }
);

export const getListingByIdHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const listing = await getListingByIdForAdmin(req.params.id);
    return success(res, listing, 'Listing');
  }
);

export const updateListingStatusHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: ListingStatus };
    const listing = await updateListingStatusByAdmin(req.params.id, status);
    return success(res, listing, 'Status updated');
  }
);

export const approveListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const listing = await approveListing(req.params.id);
    return success(res, listing, 'Listing approved');
  }
);

export const rejectListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { reason } = req.body as { reason: string };
    const listing = await rejectListing(req.params.id, reason);
    return success(res, listing, 'Listing rejected');
  }
);

export const deleteListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await deleteListing(req.params.id);
    return success(res, { ok: true }, 'Listing deleted');
  }
);

