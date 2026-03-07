import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminLayout } from '../../../../components/AdminLayout';
import { serverApiFetch } from '../../../../lib/serverApi';
import { AdminListingReviewClient } from '../../../../components/AdminListingReviewClient';

interface Listing {
  _id: string;
  price: number;
  status: string;
  userId: { name?: string; email?: string } | string;
  createdAt: string;
  year: number;
  mileage: number;
  makeId: { name: string } | string;
  modelId: { name: string } | string;
  city: string;
  coverPhotoUrl: string;
  area?: string;
  description?: string;
  fuel?: string;
  transmission?: string;
  condition?: string;
}

interface ListingResponse {
  data: Listing;
}

export default async function AdminListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  const { id } = await params;
  let listing: Listing | null = null;

  try {
    const res = await serverApiFetch<ListingResponse>(
      `/admin/listings/${id}`,
      { auth: true }
    );
    listing = res.data;
  } catch {
    listing = null;
  }

  return (
    <AdminLayout>
      <AdminListingReviewClient listing={listing} listingId={id} />
    </AdminLayout>
  );
}

