'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListingCard } from '../../components/ListingCard';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, Suspense } from 'react';

interface Listing {
  _id: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  coverPhotoUrl: string;
  status: string;
  makeId?: { name: string } | string;
  modelId?: { name: string } | string;
  make?: { name: string };
  model?: { name: string };
}

interface Make {
  id: string;
  name: string;
}

function getBrandName(item: Listing): string {
  if (item.makeId && typeof item.makeId === 'object' && 'name' in item.makeId) return item.makeId.name;
  if (item.make?.name) return item.make.name;
  return 'Unknown';
}

function getModelName(item: Listing): string {
  if (item.modelId && typeof item.modelId === 'object' && 'name' in item.modelId) return item.modelId.name;
  if (item.model?.name) return item.model.name;
  return 'Car';
}

function CarsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const makeIdParam = searchParams.get('makeId') ?? '';
  const sortByParam = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrderParam = searchParams.get('sortOrder') ?? 'desc';

  // Count active filters
  const filterKeys = ['makeId', 'modelId', 'city', 'area', 'fuel', 'transmission', 'condition', 'minPrice', 'maxPrice', 'minYear', 'maxYear'];
  const activeFilterCount = filterKeys.filter((k) => searchParams.get(k)).length;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const query = new URLSearchParams(searchParams.toString());
    if (!query.get('page')) query.set('page', '1');
    if (!query.get('sortBy')) query.set('sortBy', sortByParam);
    if (!query.get('sortOrder')) query.set('sortOrder', sortOrderParam);
    if (!query.get('limit')) query.set('limit', '8');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const fetches: Promise<any>[] = [
        fetch(`${baseUrl}/listings?${query.toString()}`).then((r) => {
          if (!r.ok) throw new Error(`API error: ${r.status}`);
          return r.json();
        }),
        fetch(`${baseUrl}/meta/makes`).then((r) => {
          if (!r.ok) throw new Error(`API error: ${r.status}`);
          return r.json();
        }),
      ];

      if (makeIdParam) {
        fetches.push(
          fetch(`${baseUrl}/meta/models?makeId=${makeIdParam}`).then((r) => {
            if (!r.ok) throw new Error(`API error: ${r.status}`);
            return r.json();
          })
        );
      }

      const results = await Promise.all(fetches);
      const [listingsRes, makesRes] = results;
      const modelsRes = results[2] ?? null;

      setItems(listingsRes.data?.items ?? []);
      setTotal(listingsRes.data?.total ?? 0);
      setPage(listingsRes.data?.page ?? 1);
      setLimit(listingsRes.data?.limit ?? 8);
      setMakes(makesRes.data ?? []);
      setModels(modelsRes?.data ?? []);

      const idsRes = await fetch('/api/favorites/ids');
      if (idsRes.ok) {
        const idsData = await idsRes.json();
        setFavoritedIds(new Set(idsData.data?.listingIds ?? []));
      } else {
        setFavoritedIds(new Set());
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, makeIdParam, sortByParam, sortOrderParam]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'string' && value.trim() !== '') {
        params.append(key, value.trim());
      }
    }

    // Always reset to first page and enforce 8 per page
    params.set('page', '1');
    if (!params.get('limit')) {
      params.set('limit', '8');
    }

    router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSortChange = (field: string, order: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', field);
    params.set('sortOrder', order);
    params.delete('page');
    if (!params.get('limit')) {
      params.set('limit', '8');
    }
    router.push(`/cars?${params.toString()}`);
  };

  const pages = Math.max(1, Math.ceil(total / (limit || 1)));

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero – same vibe as home & sell: image + purple overlay, centered */}
      <section
        className="relative overflow-hidden px-6 py-8 md:px-10 md:py-12 text-white"
        style={{
          backgroundImage: 'url("/images/carbg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-purple-600/80 to-purple-700/85" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            {loading ? 'Loading...' : `${total.toLocaleString()} vehicles`} • Bangladesh
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Browse All Cars
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Explore thousands of verified vehicles from trusted sellers and dealers. Filter by brand, price, and location to find your perfect match.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setShowFilters(true)}
              className="bg-white text-primary hover:bg-gray-50 font-semibold"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start searching
              </span>
            </Button>
            <Button
              asChild
              className="border-2 border-white bg-transparent text-white hover:bg-white/20 font-semibold"
            >
              <Link href="/sell">Sell your car</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter Toggle + Sort Controls Row */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  showFilters
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    showFilters ? 'bg-white/20' : 'bg-primary text-white'
                  }`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <Link
                  href="/cars"
                  className="text-sm text-gray-500 hover:text-primary font-medium transition-colors"
                >
                  Clear all
                </Link>
              )}

              {!loading && (
                <span className="hidden sm:inline text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{total}</span> result{total === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort by</span>
              <select
                value={sortByParam}
                onChange={(e) => handleSortChange(e.target.value, sortOrderParam)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="year">Year</option>
                <option value="mileage">Mileage</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  handleSortChange(
                    sortByParam,
                    sortOrderParam === 'desc' ? 'asc' : 'desc'
                  )
                }
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                title={sortOrderParam === 'desc' ? 'Descending' : 'Ascending'}
              >
                {sortOrderParam === 'desc' ? (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-purple-200 shadow-lg shadow-purple-100/50 mb-3 overflow-hidden">
            <form className="p-6" onSubmit={handleFilterSubmit}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</label>
                  <select name="makeId" defaultValue={makeIdParam} className={inputClass}>
                    <option value="">All brands</option>
                    {makes.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</label>
                  <select name="modelId" defaultValue={searchParams.get('modelId') ?? ''} className={inputClass}>
                    <option value="">All models</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
                  <input type="text" name="city" defaultValue={searchParams.get('city') ?? ''} placeholder="e.g. Dhaka" className={inputClass} />
                </div>

                {/* Fuel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuel</label>
                  <select name="fuel" defaultValue={searchParams.get('fuel') ?? ''} className={inputClass}>
                    <option value="">Any</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>

                {/* Transmission */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transmission</label>
                  <select name="transmission" defaultValue={searchParams.get('transmission') ?? ''} className={inputClass}>
                    <option value="">Any</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</label>
                  <select name="condition" defaultValue={searchParams.get('condition') ?? ''} className={inputClass}>
                    <option value="">Any</option>
                    <option value="used">Used</option>
                    <option value="reconditioned">Reconditioned</option>
                    <option value="new">New</option>
                  </select>
                </div>

                {/* Min Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Price</label>
                  <input type="number" name="minPrice" defaultValue={searchParams.get('minPrice') ?? ''} placeholder="0" min={0} className={inputClass} />
                </div>

                {/* Max Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Price</label>
                  <input type="number" name="maxPrice" defaultValue={searchParams.get('maxPrice') ?? ''} placeholder="10000000" min={0} className={inputClass} />
                </div>

                {/* Min Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Year</label>
                  <input type="number" name="minYear" defaultValue={searchParams.get('minYear') ?? ''} placeholder="2010" className={inputClass} />
                </div>

                {/* Max Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Year</label>
                  <input type="number" name="maxYear" defaultValue={searchParams.get('maxYear') ?? ''} placeholder="2026" className={inputClass} />
                </div>

                {/* Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</label>
                  <input type="text" name="area" defaultValue={searchParams.get('area') ?? ''} placeholder="e.g. Gulshan" className={inputClass} />
                </div>

                {/* Actions */}
                <div className="space-y-1.5 flex items-end">
                  <div className="flex gap-2 w-full">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-purple-800 text-white font-semibold">
                      Search
                    </Button>
                    <Button asChild variant="outline" className="border-gray-200 text-gray-600">
                      <Link href="/cars">Reset</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>

      {/* Purple gradient background for listings section */}
      <div className="bg-gradient-to-b from-purple-100 via-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error */}
          {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-2 shadow-lg shadow-red-100/50">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {loadError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-purple-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Loading cars...</span>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ListingCard
                key={item._id}
                id={item._id}
                coverPhotoUrl={item.coverPhotoUrl}
                price={item.price}
                year={item.year}
                mileage={item.mileage}
                city={item.city}
                area={item.area}
                status={item.status}
                brand={getBrandName(item)}
                model={getModelName(item)}
                initialFavorite={favoritedIds.has(item._id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && !loadError && (
          <div className="bg-white rounded-2xl border border-purple-200 p-16 text-center shadow-lg shadow-purple-100/50">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any cars matching your criteria. Try adjusting your filters or browse all available cars.
            </p>
            <Button asChild variant="outline" className="border-gray-200 font-semibold">
              <Link href="/cars">Clear all filters</Link>
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10 pt-8 border-t border-purple-100">
            {/* Previous */}
            {page > 1 && (
              <Link
                href={`/cars?${(() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set('page', String(page - 1));
                  if (!q.get('limit')) q.set('limit', '8');
                  return q.toString();
                })()}`}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </Link>
            )}

            {/* Page Numbers */}
            {Array.from({ length: pages }).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === page;

              // Show first, last, current, and neighbors
              const show =
                p === 1 ||
                p === pages ||
                Math.abs(p - page) <= 1;

              if (!show) {
                // Show ellipsis once
                if (p === 2 && page > 3) {
                  return (
                    <span key={p} className="px-2 text-gray-400 text-sm">...</span>
                  );
                }
                if (p === pages - 1 && page < pages - 2) {
                  return (
                    <span key={p} className="px-2 text-gray-400 text-sm">...</span>
                  );
                }
                return null;
              }

              const q = new URLSearchParams(searchParams.toString());
              q.set('page', String(p));
              if (!q.get('limit')) q.set('limit', '8');

              return (
                <Link
                  key={p}
                  href={`/cars?${q.toString()}`}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </Link>
              );
            })}

            {/* Next */}
            {page < pages && (
              <Link
                href={`/cars?${(() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set('page', String(page + 1));
                  if (!q.get('limit')) q.set('limit', '8');
                  return q.toString();
                })()}`}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}
