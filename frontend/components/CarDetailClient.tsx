'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { ContactSeller } from './ContactSeller';
import { FavoriteButton } from './FavoriteButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;

interface Photo {
  url: string;
  sortOrder: number;
}

interface PopulatedRef {
  _id: string;
  name: string;
  slug?: string;
}

interface Listing {
  _id: string;
  userId: string;
  account_type_snapshot: 'individual' | 'dealer';
  makeId: string | PopulatedRef;
  modelId: string | PopulatedRef;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  condition: string;
  city: string;
  area: string;
  description: string;
  phoneOverride?: string;
  status: string;
  coverPhotoUrl: string;
  photos: Photo[];
}

interface Make { id: string; name: string; }
interface Model { id: string; name: string; }

interface CarDetailClientProps {
  listing: Listing;
  isOwner: boolean;
  initialFavorite?: boolean;
}

function getName(ref: string | PopulatedRef): string {
  if (typeof ref === 'object' && ref?.name) return ref.name;
  return '';
}

function getId(ref: string | PopulatedRef): string {
  if (typeof ref === 'object' && ref?._id) return ref._id;
  return ref as string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100' },
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200' },
  live: { label: 'Live', color: 'text-green-700', bg: 'bg-green-50 border border-green-200' },
  paused: { label: 'Paused', color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  sold: { label: 'Sold', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
};

export function CarDetailClient({ listing: initial, isOwner, initialFavorite = false }: CarDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listing, setListing] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoReorderLoading, setPhotoReorderLoading] = useState(false);
  const [photoDeletingUrl, setPhotoDeletingUrl] = useState<string | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const autoOpenedRef = useRef(false);

  const fromMyListings = searchParams.get('mine') === '1' || searchParams.get('mine') === 'true';

  // Edit form state
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [editForm, setEditForm] = useState({
    makeId: getId(listing.makeId),
    modelId: getId(listing.modelId),
    year: String(listing.year),
    price: String(listing.price),
    mileage: String(listing.mileage),
    fuel: listing.fuel,
    transmission: listing.transmission,
    condition: listing.condition,
    city: listing.city,
    area: listing.area,
    description: listing.description,
    phoneOverride: listing.phoneOverride || '',
  });

  const canEdit = (isOwner || fromMyListings) && ['draft', 'pending'].includes(listing.status);
  const makeName = getName(listing.makeId);
  const modelName = getName(listing.modelId);
  const gallery = listing.photos?.length
    ? listing.photos
    : [{ url: listing.coverPhotoUrl, sortOrder: 0 }];
  const phone = listing.phoneOverride ?? null;
  const isDealer = listing.account_type_snapshot === 'dealer';
  const statusCfg = STATUS_CFG[listing.status] || STATUS_CFG.draft;

  useEffect(() => {
    // Auto-enter edit mode once when coming from \"Edit\" in My Listings (?edit=1)
    if (autoOpenedRef.current) return;
    const shouldStartEditing =
      (searchParams.get('edit') === '1' || searchParams.get('edit') === 'true') &&
      canEdit &&
      !editing;
    if (shouldStartEditing) {
      autoOpenedRef.current = true;
      setEditing(true);
    }
  }, [searchParams, canEdit, editing]);

  useEffect(() => {
    if (!editing) return;
    apiFetch<{ data: Make[] }>('/meta/makes')
      .then((res) => setMakes(res.data))
      .catch(() => {});
  }, [editing]);

  useEffect(() => {
    if (!editing || !editForm.makeId) return;
    apiFetch<{ data: Model[] }>(`/meta/models?makeId=${editForm.makeId}`)
      .then((res) => setModels(res.data))
      .catch(() => {});
  }, [editing, editForm.makeId]);

  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeId: editForm.makeId,
          modelId: editForm.modelId,
          year: Number(editForm.year),
          price: Number(editForm.price),
          mileage: Number(editForm.mileage),
          fuel: editForm.fuel,
          transmission: editForm.transmission,
          condition: editForm.condition,
          city: editForm.city,
          area: editForm.area,
          description: editForm.description,
          phoneOverride: editForm.phoneOverride || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update listing');
      }
      setListing(data.data);
      setEditing(false);
      setSuccessMsg('Listing updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const editPhotos = listing.photos?.length
    ? [...listing.photos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  const onUploadEditPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !listing._id) return;
    const remaining = MAX_PHOTOS - editPhotos.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      e.target.value = '';
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      const filesToUpload = Array.from(files).slice(0, remaining);
      filesToUpload.forEach((file) => formData.append('photos', file));
      const res = await fetch(`/api/listings/${listing._id}/photos`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to upload photos');
      setListing((prev) => ({
        ...prev,
        photos: data.data?.photos ?? prev.photos,
        coverPhotoUrl: data.data?.coverPhotoUrl ?? prev.coverPhotoUrl,
      }));
      setSuccessMsg(
        data.data?.photos?.length >= MIN_PHOTOS
          ? 'Photos updated. You can save other changes or add more.'
          : `Photo uploaded. Add at least ${MIN_PHOTOS - (data.data?.photos?.length ?? 0)} more for submission.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const onReorderEditPhoto = async (fromIndex: number, direction: 'up' | 'down') => {
    if (editPhotos.length < 2) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= editPhotos.length) return;
    const reordered = [...editPhotos];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    const orderedUrls = reordered.map((p) => p.url);
    setError(null);
    setPhotoReorderLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing._id}/photos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to reorder photos');
      setListing((prev) => ({
        ...prev,
        photos: data.data?.photos ?? prev.photos,
        coverPhotoUrl: data.data?.coverPhotoUrl ?? prev.coverPhotoUrl,
      }));
      setSuccessMsg('Photo order updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to reorder photos');
    } finally {
      setPhotoReorderLoading(false);
    }
  };

  const onRemoveEditPhoto = async (photoUrl: string) => {
    if (!listing._id) return;
    setError(null);
    setSuccessMsg(null);
    setPhotoDeletingUrl(photoUrl);
    try {
      const res = await fetch(`/api/listings/${listing._id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [photoUrl] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to remove photo');
      setListing((prev) => ({
        ...prev,
        photos: data.data?.photos ?? prev.photos,
        coverPhotoUrl: data.data?.coverPhotoUrl ?? prev.coverPhotoUrl,
      }));
      setSuccessMsg('Photo removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove photo');
    } finally {
      setPhotoDeletingUrl(null);
    }
  };

  const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';

  const pageBgClass =
    'min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50';

  return (
    <div className={pageBgClass}>
      <section
        className="relative overflow-hidden px-4 py-8 md:px-8 md:py-12 text-white"
        style={{
          backgroundImage: 'url(\"/images/carbg.jpg\")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-purple-600/80 to-purple-700/85" />
        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs md:text-sm font-medium backdrop-blur-sm">
            {editing && canEdit ? (
              <>
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
                <span>Editing your listing • Bangladesh</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.5)]" />
                <span className="uppercase tracking-wide text-[11px] md:text-xs font-semibold">
                  {listing.status === 'live' ? 'Live listing' : 'Preview mode'} • {listing.city}
                </span>
              </>
            )}
          </div>
          {editing && canEdit ? (
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Refine Your Car Listing
              </h1>
              <p className="text-sm md:text-base text-white/95 max-w-2xl mx-auto leading-relaxed">
                Update details, adjust pricing, and refresh your photos so the right buyers fall in love with your car.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                {listing.year} {makeName} {modelName}
              </h1>
              <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
                BDT {listing.price.toLocaleString()} • {listing.condition} • {listing.fuel} •{' '}
                {listing.transmission} • {listing.city}, {listing.area}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('listing-gallery');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-primary font-semibold text-sm shadow-sm hover:bg-gray-50 transition-colors"
                >
                  View photos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('listing-contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/70 bg-transparent text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Contact seller
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Owner Banner */}
        {isOwner && listing.status !== 'live' && (
          <div className={`rounded-xl px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-3 ${statusCfg.bg}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              <span className="text-sm text-gray-500">
                — Only you can see this listing.
              </span>
            </div>
            {canEdit && !editing && (
              <Button
                onClick={() => {
                  setEditForm({
                    makeId: getId(listing.makeId),
                    modelId: getId(listing.modelId),
                    year: String(listing.year),
                    price: String(listing.price),
                    mileage: String(listing.mileage),
                    fuel: listing.fuel,
                    transmission: listing.transmission,
                    condition: listing.condition,
                    city: listing.city,
                    area: listing.area,
                    description: listing.description,
                    phoneOverride: listing.phoneOverride || '',
                  });
                  setEditing(true);
                }}
                size="sm"
                className="bg-primary hover:bg-purple-800 text-white font-semibold"
              >
                Edit Listing
              </Button>
            )}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {editing && canEdit ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Edit Listing</h2>
              </div>
              <button
                onClick={() => {
                  if (fromMyListings) {
                    router.push('/my-listings');
                  } else {
                    setEditing(false);
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Make</Label>
                  <select value={editForm.makeId} onChange={(e) => setEditForm({ ...editForm, makeId: e.target.value, modelId: '' })} className={selectClass}>
                    <option value="">Select make</option>
                    {makes.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</Label>
                  <select value={editForm.modelId} onChange={(e) => setEditForm({ ...editForm, modelId: e.target.value })} className={selectClass} disabled={!editForm.makeId}>
                    <option value="">{editForm.makeId ? 'Select model' : 'Select make first'}</option>
                    {models.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</Label>
                  <Input type="number" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</Label>
                  <select value={editForm.condition} onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })} className={selectClass}>
                    <option value="used">Used</option>
                    <option value="reconditioned">Reconditioned</option>
                    <option value="new">New</option>
                  </select>
                </div>
              </div>

              {/* Specs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (BDT)</Label>
                  <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mileage (km)</Label>
                  <Input type="number" value={editForm.mileage} onChange={(e) => setEditForm({ ...editForm, mileage: e.target.value })} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuel</Label>
                  <select value={editForm.fuel} onChange={(e) => setEditForm({ ...editForm, fuel: e.target.value })} className={selectClass}>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="octane">Octane</option>
                    <option value="cng">CNG</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transmission</Label>
                  <select value={editForm.transmission} onChange={(e) => setEditForm({ ...editForm, transmission: e.target.value })} className={selectClass}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</Label>
                  <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</Label>
                  <Input value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Phone (optional)</Label>
                <Input
                  value={editForm.phoneOverride}
                  onChange={(e) => setEditForm({ ...editForm, phoneOverride: e.target.value })}
                  placeholder="e.g. 01711234567"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              {/* Photos (edit) */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Photos ({editPhotos.length}/{MAX_PHOTOS})
                </Label>
                <p className="text-xs text-gray-500">
                  First photo is the cover. Reorder with arrows. Need between {MIN_PHOTOS} and {MAX_PHOTOS} photos to submit for review.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {editPhotos.map((photo, idx) => (
                    <div
                      key={photo.url}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${
                        idx === 0 ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      {!imgErrors.has(photo.url) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photo.url}
                          alt=""
                          onError={() => setImgErrors((prev) => new Set(prev).add(photo.url))}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src="/images/carplace.png" alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        disabled={photoReorderLoading || photoDeletingUrl === photo.url}
                        onClick={() => onRemoveEditPhoto(photo.url)}
                        className="absolute top-1.5 right-1.5 inline-flex items-center justify-center rounded-full bg-black/55 text-white hover:bg-red-600 transition-colors w-6 h-6 text-[10px] font-bold disabled:opacity-50 disabled:pointer-events-none"
                        title="Remove photo"
                      >
                        {photoDeletingUrl === photo.url ? (
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          '×'
                        )}
                      </button>
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent pt-4">
                        <button
                          type="button"
                          disabled={photoReorderLoading || idx === 0}
                          onClick={() => onReorderEditPhoto(idx, 'up')}
                          className="p-1.5 rounded-md bg-white/90 text-gray-700 hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
                          title="Move left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          type="button"
                          disabled={photoReorderLoading || idx === editPhotos.length - 1}
                          onClick={() => onReorderEditPhoto(idx, 'down')}
                          className="p-1.5 rounded-md bg-white/90 text-gray-700 hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
                          title="Move right"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 text-[10px] font-semibold bg-primary text-white px-1.5 py-0.5 rounded">Cover</span>
                      )}
                    </div>
                  ))}
                  {editPhotos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-1"
                    >
                      {photoUploading ? (
                        <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                          <span className="text-xs font-medium text-gray-500">Add photos</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onUploadEditPhotos}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-purple-800 text-white font-semibold px-8"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (fromMyListings) {
                      router.push('/my-listings');
                    } else {
                      setEditing(false);
                    }
                  }}
                  className="font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Photo Gallery */}
              <div
                id="listing-gallery"
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Main Photo */}
                <div className="relative aspect-video bg-gray-100">
                  {!imgErrors.has(gallery[selectedPhoto]?.url) && gallery[selectedPhoto]?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={gallery[selectedPhoto].url}
                      alt={`${makeName} ${modelName}`}
                      onError={() => setImgErrors((prev) => new Set(prev).add(gallery[selectedPhoto].url))}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src="/images/carplace.png" alt="Placeholder" className="h-full w-full object-cover" />
                  )}
                  {/* Photo counter */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                    {selectedPhoto + 1} / {gallery.length}
                  </div>
                  {/* Status badge for non-live */}
                  {listing.status !== 'live' && (
                    <div className={`absolute top-3 left-3 ${statusCfg.bg} ${statusCfg.color} px-3 py-1 rounded-lg text-xs font-semibold`}>
                      {statusCfg.label}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {gallery.length > 1 && (
                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((photo, idx) => (
                        <button
                          key={photo.url}
                          type="button"
                          onClick={() => setSelectedPhoto(idx)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === selectedPhoto ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Details Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {listing.year} {makeName} {modelName}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {listing.condition} · {listing.fuel} · {listing.transmission}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary">
                      BDT {listing.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Year</p>
                    <p className="text-sm font-bold text-gray-900">{listing.year}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mileage</p>
                    <p className="text-sm font-bold text-gray-900">{listing.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fuel</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{listing.fuel}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transmission</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{listing.transmission}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {listing.city}, {listing.area}
                </div>

                {/* Description */}
                {listing.description && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              {/* Owner Actions */}
              {isOwner && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Manage Listing</h3>
                  {canEdit && (
                    <Button
                      onClick={() => setEditing(true)}
                      className="w-full bg-primary hover:bg-purple-800 text-white font-semibold"
                    >
                      Edit Listing
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full font-semibold"
                  >
                    <Link href="/my-listings">Back to My Listings</Link>
                  </Button>
                </div>
              )}

              {/* Favorite & Contact */}
              {listing.status === 'live' && (
                <div
                  id="listing-contact"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4"
                >
                  <FavoriteButton listingId={listing._id} initial={initialFavorite} />
                  <div className="border-t border-gray-100 pt-4">
                    <ContactSeller phone={phone} />
                  </div>
                  {isDealer && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Dealer
                      </h3>
                      <Button asChild variant="outline" className="w-full justify-center text-sm font-semibold">
                        <Link href={`/dealers/${listing.userId}`}>View Dealer Profile</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Non-live owner contact info */}
              {isOwner && listing.status !== 'live' && phone && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Contact Phone</h3>
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
