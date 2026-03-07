import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import {
  getFavoriteListingIds,
  listFavorites,
  removeFavorite,
  saveFavorite
} from '../services/favorite.service';

export const saveFavoriteHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { listingId } = req.params;
    await saveFavorite(user, listingId);
    return success(res, { ok: true }, 'Saved to favorites', 201);
  }
);

export const removeFavoriteHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { listingId } = req.params;
    await removeFavorite(user, listingId);
    return success(res, { ok: true }, 'Removed from favorites');
  }
);

export const listFavoritesHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const result = await listFavorites(user, req.query);
    return success(res, result, 'Favorites');
  }
);

export const getFavoriteIdsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const listingIds = await getFavoriteListingIds(user);
    return success(res, { listingIds }, 'Favorite listing IDs');
  }
);

