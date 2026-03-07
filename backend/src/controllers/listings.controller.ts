import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../utils/validation';
import { success } from '../utils/apiResponse';
import {
  addPhotosToListing,
  changeListingStatus,
  createDraftListing,
  getMyListings,
  getPublicListing,
  listDealerLiveListings,
  removeListingPhotos,
  reorderListingPhotos,
  searchPublicListings,
  updateListing
} from '../services/listing.service';

const baseListingSchema = z.object({
  makeId: z.string().min(1),
  modelId: z.string().min(1),
  year: z.number().int().min(1950),
  price: z.number().min(0),
  mileage: z.number().min(0),
  fuel: z.enum(['petrol', 'diesel', 'octane', 'cng', 'hybrid', 'electric', 'other']),
  transmission: z.enum(['manual', 'automatic', 'cvt', 'other']),
  condition: z.enum(['used', 'reconditioned', 'new']),
  city: z.string().min(1).max(80),
  area: z.string().min(1).max(80),
  description: z.string().min(1).max(4000),
  phoneOverride: z.string().max(40).optional().nullable()
});

const createListingSchema = baseListingSchema;
const updateListingSchema = baseListingSchema.partial();

const statusSchema = z.object({
  status: z.enum(['draft', 'pending', 'live', 'paused', 'sold', 'rejected'])
});

const reorderPhotosSchema = z.object({
  orderedUrls: z.array(z.string().min(1))
});

const deletePhotosSchema = z.object({
  urls: z.array(z.string().min(1)).min(1)
});

export const validateCreateListing = validateRequest({
  body: createListingSchema
});

export const validateUpdateListing = validateRequest({
  body: updateListingSchema
});

export const validateStatusChange = validateRequest({
  body: statusSchema
});

export const validateReorderPhotos = validateRequest({
  body: reorderPhotosSchema
});

export const validateDeletePhotos = validateRequest({
  body: deletePhotosSchema
});

export const createListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const listing = await createDraftListing(user, req.body);
    return success(res, listing, 'Listing created', 201);
  }
);

export const updateListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const listing = await updateListing(user, req.params.id, req.body);
    return success(res, listing, 'Listing updated');
  }
);

export const addPhotosHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const files = (req.files as Express.Multer.File[]) || [];
    const listing = await addPhotosToListing(user, req.params.id, files);
    return success(res, listing, 'Photos uploaded');
  }
);

export const reorderPhotosHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { orderedUrls } = req.body as { orderedUrls: string[] };
    const listing = await reorderListingPhotos(user, req.params.id, orderedUrls);
    return success(res, listing, 'Photos reordered');
  }
);

export const deletePhotosHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { urls } = req.body as { urls: string[] };
    const listing = await removeListingPhotos(user, req.params.id, urls);
    return success(res, listing, 'Photos removed');
  }
);

export const changeStatusHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { status } = req.body as { status: any };
    const listing = await changeListingStatus(user, req.params.id, status);
    return success(res, listing, 'Status updated');
  }
);

export const getMyListingsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const result = await getMyListings(user, req.query);
    return success(res, result, 'My listings');
  }
);

export const getPublicListingHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const listing = await getPublicListing(req.params.id, req.user?.id);
    return success(res, listing, 'Listing');
  }
);

export const searchPublicListingsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await searchPublicListings(req.query);
    return success(res, result, 'Listings');
  }
);

export const listDealerLiveListingsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { dealerId } = req.params;
    const result = await listDealerLiveListings(dealerId, req.query);
    return success(res, result, 'Dealer listings');
  }
);

