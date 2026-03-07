'use client';

import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardTimestamp } from './DashboardTimestamp';

interface DailyCount {
  date: string;
  count: number;
}

interface DashboardData {
  usersTotal: number;
  dealersTotal: number;
  listingsByStatus: Record<string, number>;
  favoritesTotal: number;
  listingsPerDay: DailyCount[];
  usersPerDay: DailyCount[];
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
}

const STATUS_COLORS: Record<string, string> = {
  live: '#10b981',
  pending: '#f59e0b',
  draft: '#6b7280',
  paused: '#8b5cf6',
  sold: '#3b82f6',
  rejected: '#ef4444',
};

const FUEL_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'];

const CONDITION_COLORS: Record<string, string> = {
  used: '#3b82f6',
  reconditioned: '#f59e0b',
  new: '#10b981',
};

export function AdminDashboardClient({ dashboard }: { dashboard: DashboardData }) {
  const totalListings = Object.values(dashboard.listingsByStatus).reduce((a, b) => a + b, 0);
  const individualsTotal = dashboard.usersTotal - dashboard.dealersTotal;

  // Prepare status data for pie chart
  const statusData = Object.entries(dashboard.listingsByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || '#6b7280',
    }));

  // Prepare activity data (combined listings + users per day)
  const activityData = dashboard.listingsPerDay.map((ld, i) => ({
    date: new Date(ld.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    Listings: ld.count,
    Users: dashboard.usersPerDay[i]?.count || 0,
  }));

  // Prepare fuel data
  const fuelData = dashboard.listingsByFuel.map((f) => ({
    name: f.fuel.charAt(0).toUpperCase() + f.fuel.slice(1),
    count: f.count,
  }));

  // Prepare condition data for pie chart
  const conditionData = dashboard.listingsByCondition.map((c) => ({
    name: c.condition.charAt(0).toUpperCase() + c.condition.slice(1),
    value: c.count,
    color: CONDITION_COLORS[c.condition] || '#6b7280',
  }));

  // Top cities data
  const cityData = dashboard.topCities.map((c) => ({
    name: c.city,
    count: c.count,
  }));

  const kpis = [
    {
      label: 'Total Users',
      value: dashboard.usersTotal,
      sub: `${dashboard.dealersTotal} dealers, ${individualsTotal} individuals`,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Listings',
      value: totalListings,
      sub: `${dashboard.listingsByStatus.live} currently live`,
      gradient: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Pending Review',
      value: dashboard.listingsByStatus.pending,
      sub: 'Awaiting approval',
      gradient: 'from-amber-500 to-amber-600',
      lightBg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: '-5%',
      trendUp: false,
    },
    {
      label: 'Favorites',
      value: dashboard.favoritesTotal,
      sub: 'Total saves by users',
      gradient: 'from-rose-500 to-rose-600',
      lightBg: 'bg-rose-50',
      iconBg: 'bg-rose-100',
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      trend: '+24%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-purple-100 mt-2">Overview of your car marketplace platform</p>
          <DashboardTimestamp />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`}></div>

            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${kpi.gradient} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${kpi.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  kpi.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {kpi.trendUp ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{kpi.value.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">{kpi.label}</p>
                <p className="text-xs text-gray-500">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Activity + Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 7-Day Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
                7-Day Activity
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-4">New listings and user registrations</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                Listings
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Users
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData} barGap={6}>
              <defs>
                <linearGradient id="listingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '12px',
                }}
              />
              <Bar dataKey="Listings" fill="url(#listingsGradient)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Users" fill="url(#usersGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Listing Status Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
              Listings by Status
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-4">{totalListings} total listings</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <defs>
                {statusData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`statusGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#statusGradient-${index})`} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '12px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Fuel Type + Condition + Top Cities */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fuel Type Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></span>
              By Fuel Type
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-4">Listing distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fuelData} layout="vertical" barSize={22}>
              <defs>
                {fuelData.map((_, index) => (
                  <linearGradient key={`fuelGrad-${index}`} id={`fuelGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={FUEL_COLORS[index % FUEL_COLORS.length]} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={FUEL_COLORS[index % FUEL_COLORS.length]} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {fuelData.map((_, index) => (
                  <Cell key={`fuel-${index}`} fill={`url(#fuelGradient-${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Condition Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
              By Condition
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-4">Used vs Reconditioned vs New</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <defs>
                {conditionData.map((entry, index) => (
                  <linearGradient key={`condGrad-${index}`} id={`conditionGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cond-${index}`} fill={`url(#conditionGradient-${index})`} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '12px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
              Top Cities
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-4">By listing count</p>
          </div>
          {cityData.length > 0 ? (
            <div className="space-y-5 mt-4">
              {cityData.map((city, i) => {
                const maxCount = cityData[0].count;
                const pct = maxCount > 0 ? (city.count / maxCount) * 100 : 0;
                return (
                  <div key={city.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white`} style={{ background: `linear-gradient(135deg, ${FUEL_COLORS[i % FUEL_COLORS.length]}, ${FUEL_COLORS[(i + 1) % FUEL_COLORS.length]})` }}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{city.name}</span>
                      </div>
                      <span className="text-base font-bold text-gray-900 group-hover:scale-110 transition-transform">{city.count}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${FUEL_COLORS[i % FUEL_COLORS.length]}, ${FUEL_COLORS[(i + 1) % FUEL_COLORS.length]})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Pending + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Pending Listings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-7 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
                Recent Pending Listings
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-4">Awaiting your review</p>
            </div>
            <Link
              href="/admin/listings"
              className="px-4 py-2 text-sm font-semibold text-purple-600 hover:text-white hover:bg-purple-600 border border-purple-600 rounded-xl transition-all duration-300"
            >
              View all
            </Link>
          </div>
          {dashboard.recentPending.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentPending.map((listing) => {
                const makeName = listing.makeId?.name || 'Unknown';
                const modelName = listing.modelId?.name || 'Car';
                return (
                  <Link
                    key={listing._id}
                    href={`/cars/${listing._id}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-transparent hover:border-purple-200 transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      {listing.coverPhotoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={listing.coverPhotoUrl}
                          alt={`${makeName} ${modelName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {listing.year} {makeName} {modelName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        BDT {listing.price.toLocaleString()} &middot; {listing.city}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-900">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No pending listings to review</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/listings"
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700">Review Listings</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {dashboard.listingsByStatus.pending} pending approval
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">Manage Users</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{dashboard.usersTotal} total users</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
              Status Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(dashboard.listingsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STATUS_COLORS[status]}15` }}>
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: STATUS_COLORS[status] }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 capitalize group-hover:text-gray-900">{status}</span>
                  </div>
                  <span className="text-base font-bold text-gray-900 group-hover:scale-110 transition-transform">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
