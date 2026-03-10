'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Listing = {
  _id: string;
  price: number;
  status: string;
  createdAt: string;
  year: number;
  mileage: number;
  makeId: { name: string } | string;
  modelId: { name: string } | string;
  city: string;
  coverPhotoUrl: string;
};

function getName(v: Listing['makeId'] | Listing['modelId']): string {
  return typeof v === 'object' && v && 'name' in v ? (v as any).name : '';
}

function formatSubmitted(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminListingsTableClient({
  listings
}: {
  listings: Listing[];
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const rows = useMemo(() => {
    return listings.map((listing) => {
      const makeName = getName(listing.makeId);
      const modelName = getName(listing.modelId);
      const title =
        makeName && modelName
          ? `${listing.year} ${makeName} ${modelName}`
          : `Listing #${listing._id.slice(-8)}`;

      return {
        listing,
        title,
        submittedLabel: formatSubmitted(listing.createdAt)
      };
    });
  }, [listings]);

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Column header (desktop-ish) */}
      <div className="hidden lg:grid grid-cols-[minmax(280px,1.6fr),0.7fr,0.9fr,0.9fr,0.9fr,0.9fr,0.7fr] gap-4 px-8 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div>Listing</div>
        <div>Status</div>
        <div>Price</div>
        <div>Details</div>
        <div>Location</div>
        <div>Submitted</div>
        <div className="text-right">Action</div>
      </div>

      {rows.map(({ listing, title, submittedLabel }, index) => {
        const isOpen = open.has(listing._id);

        return (
          <div
            key={listing._id}
            className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
          >
            {/* Summary row */}
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggle(listing._id)}
                  className="relative mt-0.5"
                  aria-expanded={isOpen}
                  aria-controls={`listing-${listing._id}`}
                  title={isOpen ? 'Collapse' : 'Expand'}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                    {listing.coverPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.coverPhotoUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                        {title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block">
                        #{listing._id.slice(-8)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          listing.status === 'pending'
                            ? 'bg-purple-100 text-purple-700'
                            : listing.status === 'live'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {listing.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggle(listing._id)}
                        className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                      >
                        <svg
                          className={`w-4 h-4 text-gray-600 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      PKR {listing.price.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {listing.year}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                      {listing.mileage.toLocaleString()} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {listing.city || '—'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {submittedLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggle(listing._id)}
                      className="sm:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {isOpen ? 'Close' : 'Expand'}
                      <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <Link
                      href={`/admin/listings/${listing._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-700 hover:from-primary hover:to-purple-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                      Review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div
                id={`listing-${listing._id}`}
                className="px-4 sm:px-6 lg:px-8 pb-5"
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 capitalize">
                        {listing.status}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Price
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        PKR {listing.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Submitted
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {submittedLabel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Year
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {listing.year}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Mileage
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {listing.mileage.toLocaleString()} km
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        City
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {listing.city || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

