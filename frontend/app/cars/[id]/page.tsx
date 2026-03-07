import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../../lib/serverApi';
import { CarDetailClient } from '../../../components/CarDetailClient';

interface Listing {
  _id: string;
  userId: string;
  account_type_snapshot: 'individual' | 'dealer';
  makeId: string | { _id: string; name: string; slug: string };
  modelId: string | { _id: string; name: string; slug: string };
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  condition: string;
  city: string;
  area: string;
  description: string;
  phoneOverride?: string;
  status: string;
  coverPhotoUrl: string;
  photos: { url: string; sortOrder: number }[];
}

interface ListingResponse {
  data: Listing;
}

interface MeResponse {
  success: boolean;
  user: { _id: string; id?: string } | null;
}

interface CarPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { id } = await params;
  let listing: Listing | null = null;
  try {
    const res = await serverApiFetch<ListingResponse>(`/listings/${id}`, {
      auth: true,
    });
    listing = res.data;
  } catch {
    return notFound();
  }

  if (!listing) {
    return notFound();
  }

  // Check if current user is the owner (support userId as string or populated object)
  let isOwner = false;
  const token = cookies().get('auth_token')?.value;
  if (token) {
    try {
      const meRes = await serverApiFetch<MeResponse>('/auth/me', { auth: true });
      const userId = meRes?.user?.id ?? meRes?.user?._id;
      const listingOwnerId = typeof listing.userId === 'object' && listing.userId !== null && '_id' in listing.userId
        ? (listing.userId as { _id: string })._id
        : String(listing.userId);
      if (userId && String(userId) === String(listingOwnerId)) {
        isOwner = true;
      }
    } catch {
      // Not logged in or error — not owner
    }
  }

  let initialFavorite = false;
  if (token) {
    try {
      const idsRes = await serverApiFetch<{ data: { listingIds: string[] } }>(
        '/favorites/ids',
        { auth: true }
      );
      const ids = idsRes.data?.listingIds ?? [];
      initialFavorite = ids.includes(listing._id);
    } catch {
      // Not authenticated
    }
  }

  return (
    <CarDetailClient
      listing={listing as any}
      isOwner={isOwner}
      initialFavorite={initialFavorite}
    />
  );
}
