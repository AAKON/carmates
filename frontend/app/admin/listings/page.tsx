import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../../lib/serverApi';
import Link from 'next/link';
import { AdminLayout } from '../../../components/AdminLayout';
import { RetryButton } from '../../../components/RetryButton';
import { AdminListingsTableClient } from '../../../components/AdminListingsTableClient';

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
}

interface ListingsResponse {
  data: {
    items: Listing[];
    total: number;
    page: number;
    limit: number;
  };
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'live', label: 'Live' },
  { value: 'all', label: 'All' }
] as const;

export default async function AdminListingsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  const resolved = await searchParams;
  const status = (resolved.status === 'pending' || resolved.status === 'live' ? resolved.status : 'all') as 'pending' | 'live' | 'all';

  try {
    const res = await serverApiFetch<ListingsResponse>(
      `/admin/listings?status=${status}&page=1&limit=50`,
      { auth: true }
    );

    const listings = res.data.items;
    const total = res.data.total;

    return (
      <AdminLayout>
        <div className="space-y-8 pb-8">
          {/* Hero Header with gradient (match global theme) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-700 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md shadow-purple-900/20">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Listings
                  </h1>
                  <p className="text-purple-50 mt-2 text-base">
                    Review pending and live listings, then update status in a few clicks.
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="px-5 py-2.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 border border-white/25"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>

              {/* Tabs: Pending | Live | All */}
              <div className="mt-6 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/admin/listings?status=${opt.value}`}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all border backdrop-blur-sm ${
                      status === opt.value
                        ? 'bg-white text-primary border-white text-sm shadow-sm'
                        : 'bg-white/10 border-white/25 text-purple-50 hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>

              {/* Stats in header */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{total}</p>
                      <p className="text-sm text-purple-50/90">
                        {status === 'all' ? 'Pending + Live' : status === 'pending' ? 'Pending' : 'Live'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">Quick</p>
                      <p className="text-sm text-purple-50/90">Review mode</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">Fast</p>
                      <p className="text-sm text-purple-50/90">Processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 md:px-8 py-4 md:py-5 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
                    {status === 'all'
                      ? 'Pending & Live Listings'
                      : status === 'pending'
                        ? 'Pending Review'
                        : 'Live Listings'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <span className="font-medium">Total:</span>
                    <span className="px-2.5 md:px-3 py-1.5 bg-purple-100 text-purple-700 font-bold rounded-lg">
                      {total}
                    </span>
                  </div>
                </div>
              </div>

              <AdminListingsTableClient listings={listings} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {status === 'all' ? 'No pending or live listings' : status === 'pending' ? 'No pending listings' : 'No live listings'}
              </p>
              <p className="text-base text-gray-500 mt-2">Try another filter or check back later</p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl mt-6 transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  } catch {
    return (
      <AdminLayout>
        <div className="space-y-8 pb-8">
          {/* Error Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </span>
                Pending Listings
              </h1>
              <p className="text-red-50 mt-2 text-base">Unable to load listings data</p>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl border-2 border-red-200 p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-800 mb-2">Error loading listings</p>
            <p className="text-base text-red-600 mb-6">Please try again or check the backend service</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </Link>
              <RetryButton />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
