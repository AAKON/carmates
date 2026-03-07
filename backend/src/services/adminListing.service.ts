import { isValidObjectId } from 'mongoose';
import { Listing, type ListingDoc, type ListingStatus } from '../models/Listing';
import { ApiError } from '../utils/ApiError';
import { parsePagination } from '../utils/pagination';

export async function listPendingListings(): Promise<ListingDoc[]> {
  return Listing.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email account_type')
    .populate('makeId', 'name')
    .populate('modelId', 'name');
}

export async function listAdminListings(
  query: { status?: string; page?: unknown; limit?: unknown }
): Promise<{
  items: ListingDoc[];
  total: number;
  page: number;
  limit: number;
}> {
  const status = query.status === 'pending' || query.status === 'live' ? query.status : 'all';
  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 50
  });

  const filter: Record<string, string | { $in: string[] }> = {};
  if (status === 'pending') filter.status = 'pending';
  if (status === 'live') filter.status = 'live';
  if (status === 'all') filter.status = { $in: ['pending', 'live'] };

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email account_type')
      .populate('makeId', 'name')
      .populate('modelId', 'name'),
    Listing.countDocuments(filter)
  ]);

  return { items, total, page, limit };
}

export async function getListingByIdForAdmin(listingId: string): Promise<ListingDoc> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }
  const listing = await Listing.findById(listingId)
    .populate('userId', 'name email account_type')
    .populate('makeId', 'name')
    .populate('modelId', 'name');
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }
  return listing as ListingDoc;
}

const ALLOWED_ADMIN_STATUSES: ListingStatus[] = ['pending', 'live', 'paused', 'sold', 'rejected'];

export async function updateListingStatusByAdmin(
  listingId: string,
  status: ListingStatus
): Promise<ListingDoc> {
  if (!ALLOWED_ADMIN_STATUSES.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Allowed: ${ALLOWED_ADMIN_STATUSES.join(', ')}`);
  }
  const listing = await findListingOrThrow(listingId);
  listing.status = status;
  if (status !== 'rejected') {
    listing.rejectionReason = undefined;
  }
  await listing.save();
  return listing;
}

export async function approveListing(listingId: string): Promise<ListingDoc> {
  const listing = await findListingOrThrow(listingId);
  listing.status = 'live';
  listing.rejectionReason = undefined;
  await listing.save();
  return listing;
}

export async function rejectListing(
  listingId: string,
  reason: string
): Promise<ListingDoc> {
  const listing = await findListingOrThrow(listingId);
  listing.status = 'rejected';
  listing.rejectionReason = reason;
  await listing.save();
  return listing;
}

export async function deleteListing(listingId: string): Promise<void> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }
  const deleted = await Listing.findByIdAndDelete(listingId);
  if (!deleted) {
    throw ApiError.notFound('Listing not found');
  }
}

async function findListingOrThrow(listingId: string): Promise<ListingDoc> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }
  return listing;
}

