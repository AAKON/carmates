import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../../lib/serverApi';
import Link from 'next/link';
import { AdminLayout } from '../../../components/AdminLayout';
import { RetryButton } from '../../../components/RetryButton';

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
          {/* Hero Header with gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Listings
                  </h1>
                  <p className="text-amber-50 mt-2 text-base">
                    View pending and live listings, change status
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 border border-white/30"
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
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                      status === opt.value
                        ? 'bg-white/25 border-white/40 text-white'
                        : 'bg-white/10 border-white/20 text-amber-50 hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>

              {/* Stats in header */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{total}</p>
                      <p className="text-sm text-amber-50">{status === 'all' ? 'Pending + Live' : status === 'pending' ? 'Pending' : 'Live'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">Quick</p>
                      <p className="text-sm text-amber-50">Review Mode</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">Fast</p>
                      <p className="text-sm text-amber-50">Processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
                    {status === 'all' ? 'Pending & Live Listings' : status === 'pending' ? 'Pending Review' : 'Live Listings'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Total:</span>
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-lg">
                      {total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Listing</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Submitted</th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((listing, index) => {
                      const makeName = typeof listing.makeId === 'object' && listing.makeId?.name ? listing.makeId.name : '';
                      const modelName = typeof listing.modelId === 'object' && listing.modelId?.name ? listing.modelId.name : '';
                      const title = makeName && modelName
                        ? `${listing.year} ${makeName} ${modelName}`
                        : `Listing #${listing._id.slice(-8)}`;

                      return (
                        <tr key={listing._id} className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                  {listing.coverPhotoUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={listing.coverPhotoUrl} alt={title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-base group-hover:text-amber-600 transition-colors">{title}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block">
                                  #{listing._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              listing.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              listing.status === 'live' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {listing.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="font-bold text-gray-900 text-base">PKR {listing.price.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-700">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span className="font-semibold text-sm">{listing.year}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                                <span className="font-semibold text-sm">{listing.mileage.toLocaleString()} km</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              <span className="font-semibold text-gray-700">{listing.city || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600 font-medium">{new Date(listing.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Link
                              href={`/admin/listings/${listing._id}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group-hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Review
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
