import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../../lib/serverApi';
import Link from 'next/link';
import { AdminLayout } from '../../../components/AdminLayout';
import { UserActionsButton } from '../../../components/UserActionsButton';
import { AdminUsersTableClient } from '../../../components/AdminUsersTableClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  account_type: 'individual' | 'dealer';
  role: string;
  status: 'active' | 'blocked';
  createdAt: string;
  profileImageUrl?: string;
}

interface UsersResponse {
  data: {
    items: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export default async function AdminUsersPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const res = await serverApiFetch<UsersResponse>(
      '/admin/users',
      { auth: true }
    );

    const users = res.data.items;
    const { total } = res.data;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const blockedUsers = users.filter(u => u.status === 'blocked').length;
    const dealers = users.filter(u => u.account_type === 'dealer').length;
    const individuals = users.filter(u => u.account_type === 'individual').length;

    return (
      <AdminLayout>
        <div className="space-y-8 pb-8">
          {/* Hero Header with gradient (match admin theme) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-700 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md shadow-purple-900/20">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </span>
                    User Management
                  </h1>
                  <p className="text-purple-50 mt-2 text-base">
                    View and manage user accounts across the marketplace.
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

              {/* Stats in header */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{total}</p>
                      <p className="text-sm text-purple-50">Total users</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{activeUsers}</p>
                      <p className="text-sm text-purple-50">Active</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dealers}</p>
                      <p className="text-sm text-purple-50">Dealers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{individuals}</p>
                      <p className="text-sm text-purple-50">Individuals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {users.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 md:px-8 py-4 md:py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                    All Users
                  </h2>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <span className="font-medium">Showing:</span>
                    <span className="px-2.5 md:px-3 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-lg">
                      {users.length}
                    </span>
                  </div>
                </div>
              </div>

              <AdminUsersTableClient users={users} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">No users found</p>
              <p className="text-base text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  } catch (error) {
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
                User Management
              </h1>
              <p className="text-red-50 mt-2 text-base">Unable to load users data</p>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl border-2 border-red-200 p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-800 mb-2">Error loading users</p>
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
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
