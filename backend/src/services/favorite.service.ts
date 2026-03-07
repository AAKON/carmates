import { isValidObjectId } from 'mongoose';
import { Favorite } from '../models/Favorite';
import { Listing } from '../models/Listing';
import type { AuthUser } from '../middlewares/auth';
import { ApiError } from '../utils/ApiError';
import { parsePagination } from '../utils/pagination';

export async function saveFavorite(
  user: AuthUser,
  listingId: string
): Promise<void> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }

  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'live') {
    throw ApiError.badRequest('Only live listings can be favorited');
  }

  try {
    await Favorite.create({
      userId: user.id,
      listingId
    });
  } catch (err: any) {
    if (err && err.code === 11000) {
      // Duplicate favorite – treat as success for idempotency
      return;
    }
    throw err;
  }
}

export async function removeFavorite(
  user: AuthUser,
  listingId: string
): Promise<void> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }

  await Favorite.findOneAndDelete({
    userId: user.id,
    listingId
  });
}

export async function listFavorites(
  user: AuthUser,
  query: Record<string, unknown>
): Promise<{
  items: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 50
  });

  const [favorites, total] = await Promise.all([
    Favorite.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'listingId',
        match: { status: 'live' },
        populate: [
          { path: 'makeId', select: 'name slug' },
          { path: 'modelId', select: 'name slug' }
        ]
      }),
    Favorite.countDocuments({ userId: user.id })
  ]);

  const items = favorites
    .map((f) => f.listingId)
    .filter((l) => !!l);

  return { items, total, page, limit };
}

/** Returns listing IDs the user has favorited (for marking saved state on listing cards). */
export async function getFavoriteListingIds(user: AuthUser): Promise<string[]> {
  const docs = await Favorite.find({ userId: user.id }).select('listingId').lean();
  return docs
    .map((d) => d.listingId?.toString())
    .filter((id): id is string => !!id);
}

