import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../lib/serverApi';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminDashboardClient } from '../../components/AdminDashboardClient';

interface DashboardResponse {
  data: {
    usersTotal: number;
    dealersTotal: number;
    listingsByStatus: Record<string, number>;
    favoritesTotal: number;
    listingsPerDay: { date: string; count: number }[];
    usersPerDay: { date: string; count: number }[];
    listingsByFuel: { fuel: string; count: number }[];
    listingsByCondition: { condition: string; count: number }[];
    topCities: { city: string; count: number }[];
    recentPending: {
      _id: string;
      year: number;
      price: number;
      city: string;
      makeId: { name: string } | null;
      modelId: { name: string } | null;
      createdAt: string;
      coverPhotoUrl: string;
    }[];
  };
}

export default async function AdminPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const dashboardRes = await serverApiFetch<DashboardResponse>(
      '/admin/dashboard',
      { auth: true }
    );

    return (
      <AdminLayout>
        <AdminDashboardClient dashboard={dashboardRes.data} />
      </AdminLayout>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <AdminLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800">Error loading dashboard</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
            <p className="text-xs text-red-500 mt-3">
              Make sure you are logged in as an admin user and the backend is running.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
