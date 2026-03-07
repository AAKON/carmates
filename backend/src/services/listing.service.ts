import { isValidObjectId } from 'mongoose';
import { Listing, type ListingDoc, type ListingStatus } from '../models/Listing';
import { Make } from '../models/Make';
import { CarModel } from '../models/CarModel';
import type { AuthUser } from '../middlewares/auth';
import { ApiError } from '../utils/ApiError';
import { parsePagination } from '../utils/pagination';
import { toNumber, toString } from '../utils/query';

interface BaseListingPayload {
  makeId: string;
  modelId: string;
  year: number;
  price: number;
  mileage: number;
  fuel: ListingDoc['fuel'];
  transmission: ListingDoc['transmission'];
  condition: ListingDoc['condition'];
  city: string;
  area: string;
  description: string;
  phoneOverride?: string | null;
}

export async function createDraftListing(
  user: AuthUser,
  payload: BaseListingPayload
): Promise<ListingDoc> {
  await ensureMakeModel(payload.makeId, payload.modelId);

  const listing = await Listing.create({
    userId: user.id,
    account_type_snapshot: user.account_type,
    makeId: payload.makeId,
    modelId: payload.modelId,
    year: payload.year,
    price: payload.price,
    mileage: payload.mileage,
    fuel: payload.fuel,
    transmission: payload.transmission,
    condition: payload.condition,
    city: payload.city,
    area: payload.area,
    description: payload.description,
    phoneOverride: payload.phoneOverride ?? undefined,
    status: 'draft',
    photos: [],
    coverPhotoUrl: '/uploads/placeholder.jpg'
  });

  return listing;
}

export async function updateListing(
  user: AuthUser,
  listingId: string,
  payload: Partial<BaseListingPayload>
): Promise<ListingDoc> {
  const listing = await getOwnedListingOrThrow(user, listingId);

  if (!['draft', 'pending'].includes(listing.status)) {
    throw ApiError.forbidden('Only draft or pending listings can be edited');
  }

  if (payload.makeId || payload.modelId) {
    await ensureMakeModel(
      payload.makeId ?? listing.makeId.toString(),
      payload.modelId ?? listing.modelId.toString()
    );
  }

  if (payload.makeId) listing.makeId = payload.makeId as any;
  if (payload.modelId) listing.modelId = payload.modelId as any;
  if (payload.year !== undefined) listing.year = payload.year;
  if (payload.price !== undefined) listing.price = payload.price;
  if (payload.mileage !== undefined) listing.mileage = payload.mileage;
  if (payload.fuel !== undefined) listing.fuel = payload.fuel;
  if (payload.transmission !== undefined) listing.transmission = payload.transmission;
  if (payload.condition !== undefined) listing.condition = payload.condition;
  if (payload.city !== undefined) listing.city = payload.city;
  if (payload.area !== undefined) listing.area = payload.area;
  if (payload.description !== undefined) listing.description = payload.description;
  if (payload.phoneOverride !== undefined) {
    listing.phoneOverride = payload.phoneOverride ?? undefined;
  }

  await listing.save();
  await listing.populate('makeId', 'name slug');
  await listing.populate('modelId', 'name slug');
  return listing;
}

export async function addPhotosToListing(
  user: AuthUser,
  listingId: string,
  files: Express.Multer.File[]
): Promise<ListingDoc> {
  if (!files || files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }

  const listing = await getOwnedListingOrThrow(user, listingId);

  const existingCount = listing.photos.length;
  const newPhotos = files.map((file, index) => ({
    url: `/uploads/${file.filename}`,
    key: file.filename,
    sortOrder: existingCount + index
  }));

  listing.photos.push(...newPhotos);

  listing.photos.sort((a, b) => a.sortOrder - b.sortOrder);
  if (listing.photos.length > 0) {
    listing.coverPhotoUrl = listing.photos[0].url;
  }

  await listing.save();
  return listing;
}

export async function reorderListingPhotos(
  user: AuthUser,
  listingId: string,
  orderedUrls: string[]
): Promise<ListingDoc> {
  const listing = await getOwnedListingOrThrow(user, listingId);

  if (!Array.isArray(orderedUrls) || orderedUrls.length === 0) {
    throw ApiError.badRequest('Invalid photo order');
  }

  const photosByUrl = new Map(listing.photos.map((p) => [p.url, p]));

  const newOrder: typeof listing.photos = [];
  for (const url of orderedUrls) {
    const photo = photosByUrl.get(url);
    if (photo) {
      newOrder.push(photo);
    }
  }

  if (newOrder.length !== listing.photos.length) {
    throw ApiError.badRequest('Photo order does not match current photos');
  }

  newOrder.forEach((p, idx) => {
    p.sortOrder = idx;
  });

  listing.photos = newOrder;
  listing.coverPhotoUrl = listing.photos[0]?.url ?? listing.coverPhotoUrl;

  await listing.save();
  return listing;
}

export async function removeListingPhotos(
  user: AuthUser,
  listingId: string,
  urls: string[]
): Promise<ListingDoc> {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw ApiError.badRequest('No photos specified for removal');
  }

  const listing = await getOwnedListingOrThrow(user, listingId);

  const urlSet = new Set(urls);
  const originalCount = listing.photos.length;

  if (originalCount === 0) {
    return listing;
  }

  listing.photos = listing.photos.filter((p) => !urlSet.has(p.url));

  // Re-normalize sort order
  listing.photos.sort((a, b) => a.sortOrder - b.sortOrder);
  listing.photos.forEach((p, idx) => {
    p.sortOrder = idx;
  });

  if (listing.photos.length > 0) {
    listing.coverPhotoUrl = listing.photos[0].url;
  } else {
    // Fallback cover when all photos removed
    listing.coverPhotoUrl = '/uploads/placeholder.jpg';
  }

  await listing.save();
  return listing;
}

export async function changeListingStatus(
  user: AuthUser,
  listingId: string,
  status: ListingStatus
): Promise<ListingDoc> {
  const listing = await getOwnedListingOrThrow(user, listingId);

  const allowedForOwner: ListingStatus[] = ['draft', 'pending', 'paused', 'sold'];
  if (!allowedForOwner.includes(status)) {
    throw ApiError.badRequest('Unsupported status transition');
  }

  if (status === 'pending') {
    const photoCount = listing.photos.length;
    if (photoCount < 5 || photoCount > 20) {
      throw ApiError.badRequest(
        'Listing must have between 5 and 20 photos before submitting for review'
      );
    }
  }

  // Basic transition rules
  if (status === 'sold' && listing.status === 'draft') {
    throw ApiError.badRequest('Draft listing cannot be marked as sold');
  }

  listing.status = status;
  if (status !== 'rejected') {
    listing.rejectionReason = undefined;
  }

  await listing.save();
  return listing;
}

export async function getMyListings(
  user: AuthUser,
  query: Record<string, unknown>
): Promise<{
  items: ListingDoc[];
  total: number;
  page: number;
  limit: number;
}> {
  const status = toString(query.status ?? null, null) as ListingStatus | null;
  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 50
  });

  const filter: Record<string, unknown> = { userId: user.id };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('makeId', 'name slug')
      .populate('modelId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter)
  ]);

  return { items, total, page, limit };
}

export async function getPublicListing(
  listingId: string,
  requestingUserId?: string
): Promise<ListingDoc> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }
  const listing = await Listing.findById(listingId)
    .populate('makeId', 'name slug')
    .populate('modelId', 'name slug');
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  // Live listings are visible to everyone
  if (listing.status === 'live') {
    return listing;
  }

  // Non-live listings are only visible to the owner
  if (requestingUserId && listing.userId.toString() === requestingUserId) {
    return listing;
  }

  throw ApiError.notFound('Listing not found');
}

export async function searchPublicListings(
  query: Record<string, unknown>
): Promise<{
  items: ListingDoc[];
  total: number;
  page: number;
  limit: number;
}> {
  const filter: Record<string, unknown> = { status: 'live' };

  const makeId = toString(query.makeId ?? null, null);
  const modelId = toString(query.modelId ?? null, null);
  const city = toString(query.city ?? null, null);
  const area = toString(query.area ?? null, null);
  const fuel = toString(query.fuel ?? null, null) as ListingDoc['fuel'] | null;
  const transmission = toString(
    query.transmission ?? null,
    null
  ) as ListingDoc['transmission'] | null;
  const condition = toString(
    query.condition ?? null,
    null
  ) as ListingDoc['condition'] | null;

  const minPrice = toNumber(query.minPrice ?? null, null, { min: 0 });
  const maxPrice = toNumber(query.maxPrice ?? null, null, { min: 0 });
  const minYear = toNumber(query.minYear ?? null, null, { min: 1950 });
  const maxYear = toNumber(query.maxYear ?? null, null, { min: 1950 });

  if (makeId && isValidObjectId(makeId)) filter.makeId = makeId;
  if (modelId && isValidObjectId(modelId)) filter.modelId = modelId;
  if (city) filter.city = city;
  if (area) filter.area = area;
  if (fuel) filter.fuel = fuel;
  if (transmission) filter.transmission = transmission;
  if (condition) filter.condition = condition;

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) (filter.price as any).$gte = minPrice;
    if (maxPrice !== null) (filter.price as any).$lte = maxPrice;
  }

  if (minYear !== null || maxYear !== null) {
    filter.year = {};
    if (minYear !== null) (filter.year as any).$gte = minYear;
    if (maxYear !== null) (filter.year as any).$lte = maxYear;
  }

  const sortField = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'price', 'year', 'mileage'];

  const sort: Record<string, 1 | -1> = {};
  if (allowedSortFields.includes(sortField)) {
    sort[sortField] = sortOrder as 1 | -1;
  } else {
    sort.createdAt = -1;
  }

  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 50
  });

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('makeId', 'name slug')
      .populate('modelId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter)
  ]);

  return { items, total, page, limit };
}

export async function listDealerLiveListings(
  dealerUserId: string,
  query: Record<string, unknown>
): Promise<{
  items: ListingDoc[];
  total: number;
  page: number;
  limit: number;
}> {
  if (!isValidObjectId(dealerUserId)) {
    throw ApiError.badRequest('Invalid dealer id');
  }

  const filter: Record<string, unknown> = {
    userId: dealerUserId,
    status: 'live'
  };

  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 50
  });

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('makeId', 'name slug')
      .populate('modelId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter)
  ]);

  return { items, total, page, limit };
}

async function ensureMakeModel(makeId: string, modelId: string): Promise<void> {
  if (!isValidObjectId(makeId) || !isValidObjectId(modelId)) {
    throw ApiError.badRequest('Invalid make or model id');
  }
  const [make, model] = await Promise.all([
    Make.findById(makeId),
    CarModel.findById(modelId)
  ]);
  if (!make) throw ApiError.badRequest('Make not found');
  if (!model || model.make.toString() !== make.id) {
    throw ApiError.badRequest('Model does not belong to given make');
  }
}

async function getOwnedListingOrThrow(
  user: AuthUser,
  listingId: string
): Promise<ListingDoc> {
  if (!isValidObjectId(listingId)) {
    throw ApiError.badRequest('Invalid listing id');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }
  if (listing.userId.toString() !== user.id) {
    throw ApiError.forbidden('You do not own this listing');
  }
  return listing;
}

