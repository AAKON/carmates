'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ListingItem {
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
}

interface MyListingsPayload {
  items: ListingItem[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse {
  data: MyListingsPayload;
  message?: string;
}

interface MyListingsClientProps {
  initial: MyListingsPayload;
}

const STATUSES = ['all', 'draft', 'pending', 'live', 'paused', 'sold'] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', dot: 'bg-gray-400', bg: 'bg-gray-100' },
  pending: { label: 'Pending Review', color: 'text-amber-700', dot: 'bg-amber-400', bg: 'bg-amber-50' },
  live: { label: 'Live', color: 'text-green-700', dot: 'bg-green-500', bg: 'bg-green-50' },
  paused: { label: 'Paused', color: 'text-orange-700', dot: 'bg-orange-400', bg: 'bg-orange-50' },
  sold: { label: 'Sold', color: 'text-blue-700', dot: 'bg-blue-400', bg: 'bg-blue-50' },
  rejected: { label: 'Rejected', color: 'text-red-700', dot: 'bg-red-500', bg: 'bg-red-50' },
};

export function MyListingsClient({ initial }: MyListingsClientProps) {
  const [data, setData] = useState<MyListingsPayload>(initial);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const load = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const q =
        status === 'all'
          ? '?limit=50'
          : `?status=${encodeURIComponent(status)}&limit=50`;
      const res = await fetch(`/api/listings/mine${q}`, {
        cache: 'no-store'
      });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to load listings');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const changeStatus = async (id: string, status: string) => {
    setError(null);
    setActionLoading(id);
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to update listing');
      }
      await load(statusFilter);
    } catch (err: any) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.draft;

  const counts = initial.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Hero Header – match Sell / Favorites theme */}
      <section
        className="relative overflow-hidden px-4 py-6 md:px-8 md:py-10 text-white"
        style={{
          backgroundImage: 'url("/images/carbg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-purple-600/80 to-purple-700/85" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Manage your cars • Bangladesh</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              My Listings
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Track status, edit details, and control visibility. Your listings in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header card + filters */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your listings</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Filter by status, edit drafts, or submit for review.
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-purple-800 text-white font-semibold shadow-sm rounded-full shrink-0">
              <Link href="/sell">+ New Listing</Link>
            </Button>
          </div>
          {/* Status Filter Tabs */}
          <div className="px-5 pb-5 flex flex-wrap gap-2">
            {STATUSES.map((status) => {
              const active = statusFilter === status;
              const count = status === 'all' ? initial.total : (counts[status] || 0);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Loading listings...</span>
            </div>
          </div>
        )}

        {/* Listings */}
        {!loading && data.items.length > 0 && (
          <div className="space-y-4">
            {data.items.map((item) => {
              const cfg = statusCfg(item.status);
              const brand = item.makeId?.name || 'Unknown';
              const model = item.modelId?.name || 'Car';
              const hasImage = !imgErrors.has(item._id) && item.coverPhotoUrl;
              const isActioning = actionLoading === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <Link href={`/cars/${item._id}`} className="block md:w-64 flex-shrink-0">
                      <div className="relative aspect-video md:aspect-auto md:h-full bg-gray-100 overflow-hidden">
                        {hasImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.coverPhotoUrl}
                            alt={`${brand} ${model}`}
                            onError={() => setImgErrors((prev) => new Set(prev).add(item._id))}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src="/images/carplace.png"
                            alt="Placeholder"
                            className="h-full w-full object-cover"
                          />
                        )}
                        {/* Status badge on image */}
                        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.color} px-2.5 py-1 rounded-lg text-xs font-semibold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>
                        {/* Photo count */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.photos?.length || 0}
                        </div>
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        {/* Title & Price Row */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/cars/${item._id}`} className="hover:text-primary transition-colors">
                              <h3 className="text-lg font-bold text-gray-900">
                                {item.year} {brand} {model}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="capitalize">{item.condition}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="capitalize">{item.fuel}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="capitalize">{item.transmission}</span>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-primary whitespace-nowrap">
                            BDT {(item.price / 100000).toFixed(1)}L
                          </p>
                        </div>

                        {/* Specs Row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {item.year}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {(item.mileage / 1000).toFixed(0)}k km
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {item.city}, {item.area}
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                        <Link
                          href={`/cars/${item._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>

                        {(item.status === 'draft' || item.status === 'pending') && (
                          <Link
                            href={`/cars/${item._id}?edit=1&mine=1`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        )}

                        {item.status === 'draft' && (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => changeStatus(item._id, 'pending')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit for Review
                          </button>
                        )}

                        {item.status === 'paused' && (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => changeStatus(item._id, 'pending')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reactivate
                          </button>
                        )}

                        {item.status === 'live' && (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => changeStatus(item._id, 'paused')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pause
                          </button>
                        )}

                        {(item.status === 'live' || item.status === 'paused') && (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => changeStatus(item._id, 'sold')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark Sold
                          </button>
                        )}

                        {isActioning && (
                          <svg className="animate-spin h-4 w-4 text-gray-400 ml-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && data.items.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-14 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {statusFilter === 'all'
                ? 'No listings yet'
                : `No ${statusFilter} listings`}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {statusFilter === 'all'
                ? 'Get started by creating your first car listing. It only takes a few minutes.'
                : `You don't have any listings with "${statusFilter}" status right now.`}
            </p>
            {statusFilter === 'all' && (
              <Button asChild className="rounded-full bg-primary hover:bg-purple-800 text-white font-semibold px-6">
                <Link href="/sell">Create your first listing</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
