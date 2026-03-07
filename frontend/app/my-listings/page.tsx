import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../lib/serverApi';
import { MyListingsClient } from '../../components/MyListingsClient';

interface MyListingsResponse {
  data: {
    items: {
      _id: string;
      status: string;
      price: number;
      year: number;
      mileage: number;
      city: string;
      area: string;
      coverPhotoUrl: string;
      fuel: string;
      transmission: string;
      condition: string;
      photos: { url: string }[];
      createdAt: string;
      makeId?: { name: string };
      modelId?: { name: string };
    }[];
    total: number;
    page: number;
    limit: number;
  };
}

export default async function MyListingsPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await serverApiFetch<MyListingsResponse>(
    '/listings/mine/all?limit=50',
    {
      auth: true
    }
  );

  const initial = res.data;

  return <MyListingsClient initial={initial} />;
}
