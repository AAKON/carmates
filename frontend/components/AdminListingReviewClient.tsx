'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  // Optional fields we may get from backend but don't rely on
  area?: string;
  description?: string;
  fuel?: string;
  transmission?: string;
  condition?: string;
}

export function AdminListingReviewClient({
  listing,
  listingId
}: {
  listing: Listing | null;
  listingId: string;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<null | 'approve' | 'reject' | 'delete' | 'status'>(null);
  const [error, setError] = useState<string | null>(null);

  const ADMIN_STATUSES = ['pending', 'live', 'paused', 'sold', 'rejected'] as const;

  const makeName =
    listing && typeof listing.makeId === 'object' && 'name' in listing.makeId
      ? listing.makeId.name
      : '';
  const modelName =
    listing && typeof listing.modelId === 'object' && 'name' in listing.modelId
      ? listing.modelId.name
      : '';

  async function handleApprove() {
    if (!listing) return;
    setError(null);
    setLoadingAction('approve');
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'PUT'
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to approve listing');
      }
      router.push('/admin/listings');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve listing');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleReject() {
    if (!listing) return;
    const reason = window.prompt('Enter rejection reason (required):');
    if (!reason || !reason.trim()) {
      return;
    }
    setError(null);
    setLoadingAction('reject');
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to reject listing');
      }
      router.push('/admin/listings');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject listing');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!listing) return;
    setError(null);
    setLoadingAction('status');
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to update status');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this listing? This cannot be undone.'
    );
    if (!confirmed) return;

    setError(null);
    setLoadingAction('delete');
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/delete`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to delete listing');
      }
      router.push('/admin/listings');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete listing');
    } finally {
      setLoadingAction(null);
    }
  }

  if (!listing) {
    return (
      <div className="space-y-6 pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-black p-8 shadow-xl">
          <div className="relative">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.007v.008H12v-.008z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5h15a1.5 1.5 0 001.341-2.185L13.341 4.685a1.5 1.5 0 00-2.682 0L3.159 17.315A1.5 1.5 0 004.5 19.5z"
                  />
                </svg>
              </span>
              Listing not found
            </h1>
            <p className="text-gray-200 mt-2 text-base max-w-xl">
              This listing either does not exist, or it is no longer pending review.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-lg">
          <p className="text-base text-gray-600 mb-6">
            It may have already been approved, rejected, deleted, or never existed.
          </p>
          <Button asChild className="bg-primary hover:bg-purple-800 text-white font-semibold">
            <Link href="/admin/listings">Back to pending listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const title =
    makeName && modelName
      ? `${listing.year} ${makeName} ${modelName}`
      : `Listing #${listing._id.slice(-8)}`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </span>
              Review Listing
            </h1>
            <p className="text-amber-50 mt-2 text-base">{title}</p>
            <p className="text-xs text-amber-100/80 mt-1 font-mono">
              ID: {listing._id}{' '}
              <span className="mx-2 inline-block h-1 w-1 rounded-full bg-amber-200 align-middle" />{' '}
              Submitted {new Date(listing.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/admin/listings">Back to list</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Photo + basic info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="relative bg-gray-900">
              <div className="aspect-video bg-gray-900">
                {listing.coverPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.coverPhotoUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-xs font-semibold text-white backdrop-blur-sm capitalize">
                {listing.status}
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xl font-bold text-gray-900">{title}</p>
                <p className="text-lg font-bold text-green-700">
                  BDT {listing.price.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Year</p>
                  <p className="font-semibold text-gray-800">{listing.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mileage</p>
                  <p className="font-semibold text-gray-800">
                    {listing.mileage.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">City</p>
                  <p className="font-semibold text-gray-800">{listing.city || '—'}</p>
                </div>
              </div>
              {listing.description && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & metadata */}
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Change status</h2>
            <p className="text-xs text-gray-500 mb-4">
              Set listing status. Live = visible to buyers; Paused = hidden; Sold = no longer available; Rejected = not approved.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {ADMIN_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  disabled={loadingAction !== null || listing.status === s}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    listing.status === s
                      ? 'bg-gray-200 text-gray-600 cursor-default'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">Moderation actions</h2>
            <p className="text-xs text-gray-500 mb-4">
              Approve to publish, reject with a reason, or delete the listing.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={handleApprove}
                disabled={loadingAction !== null || listing.status === 'live'}
              >
                {loadingAction === 'approve' ? 'Approving…' : 'Approve & publish'}
              </Button>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handleReject}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'reject' ? 'Rejecting…' : 'Reject with reason'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 font-semibold"
                onClick={handleDelete}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'delete' ? 'Deleting…' : 'Delete listing'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

