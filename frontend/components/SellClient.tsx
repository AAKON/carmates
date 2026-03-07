'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Make {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface Photo {
  url: string;
  key?: string;
  sortOrder: number;
}

interface CreateListingResponse {
  data: {
    _id: string;
  };
}

interface ListingWithPhotos {
  data: {
    photos: Photo[];
    coverPhotoUrl: string;
  };
}

type Fuel = 'petrol' | 'diesel' | 'octane' | 'cng' | 'hybrid' | 'electric' | 'other';
type Transmission = 'manual' | 'automatic' | 'cvt' | 'other';
type Condition = 'used' | 'reconditioned' | 'new';

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;

export function SellClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState<Fuel>('petrol');
  const [transmission, setTransmission] = useState<Transmission>('automatic');
  const [condition, setCondition] = useState<Condition>('used');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');

  // Flow state
  const [listingId, setListingId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  // Current step: 1 = details, 2 = photos, 3 = review/submit
  const currentStep = submitted ? 3 : listingId ? 2 : 1;

  useEffect(() => {
    apiFetch<{ data: Make[] }>('/meta/makes')
      .then((res) => setMakes(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!makeId) {
      setModels([]);
      setModelId('');
      return;
    }
    apiFetch<{ data: Model[] }>(`/meta/models?makeId=${makeId}`)
      .then((res) => setModels(res.data))
      .catch(() => {});
  }, [makeId]);

  const createDraft = async () => {
    setError(null);
    setSuccessMsg(null);
    setCreating(true);
    try {
      const body = {
        makeId,
        modelId,
        year: Number(year),
        price: Number(price),
        mileage: Number(mileage),
        fuel,
        transmission,
        condition,
        city,
        area,
        description,
        phoneOverride: phoneOverride || null,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as CreateListingResponse;
      if (!res.ok) {
        throw new Error((data as any)?.message || 'Failed to create listing');
      }
      setListingId(data.data._id);
      setSuccessMsg('Draft saved! Now upload your photos.');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  };

  const onUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!listingId) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      e.target.value = '';
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    try {
      const formData = new FormData();
      const filesToUpload = Array.from(files).slice(0, remaining);
      filesToUpload.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as ListingWithPhotos;
      if (!res.ok) {
        throw new Error((data as any)?.message || 'Failed to upload photos');
      }
      setPhotos(data.data.photos ?? []);
      const count = data.data.photos?.length ?? 0;
      if (count >= MIN_PHOTOS) {
        setSuccessMsg(`${count} photos uploaded. You can submit your listing or add more.`);
      } else {
        setSuccessMsg(`${count} photo${count !== 1 ? 's' : ''} uploaded. Add at least ${MIN_PHOTOS - count} more.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSubmitForReview = async () => {
    if (!listingId) return;
    if (photos.length < MIN_PHOTOS) {
      setError(`Please upload at least ${MIN_PHOTOS} photos before submitting.`);
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to submit listing');
      }
      setSubmitted(true);
      setSuccessMsg('Your listing has been submitted for review!');
    } catch (err: any) {
      setError(err.message || 'Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  const makeName = makes.find((m) => m.id === makeId)?.name || '';
  const modelName = models.find((m) => m.id === modelId)?.name || '';
  const photoProgress = Math.min((photos.length / MIN_PHOTOS) * 100, 100);

  const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';

  const steps = [
    { number: 1, label: 'Car Details', description: 'Enter your car info' },
    { number: 2, label: 'Upload Photos', description: `Add ${MIN_PHOTOS}–${MAX_PHOTOS} images` },
    { number: 3, label: 'Submit', description: 'Send for review' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Hero Header – match home hero vibe */}
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
            <span>Easy 3-step selling • Bangladesh</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              List Your Car With Confidence
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Share your car&apos;s details, upload clear photos, and submit for a quick review.
              Your listing can go live in minutes for thousands of serious buyers.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-purple-200 shadow-md shadow-purple-100/50 px-4 py-4 md:px-5 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-200'
                          : isActive
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-300'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && !submitted && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── STEP 3: Submitted Success ── */}
        {submitted && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Listing Submitted!
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Your listing for the {year} {makeName} {modelName} has been submitted for review.
              You&apos;ll be notified once it&apos;s approved and goes live.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                onClick={() => router.push('/my-listings')}
                className="bg-primary hover:bg-purple-800 text-white font-semibold"
              >
                View My Listings
              </Button>
              <Button
                onClick={() => {
                  setListingId(null);
                  setPhotos([]);
                  setSubmitted(false);
                  setSuccessMsg(null);
                  setError(null);
                  setMakeId('');
                  setModelId('');
                  setYear('');
                  setPrice('');
                  setMileage('');
                  setFuel('petrol');
                  setTransmission('automatic');
                  setCondition('used');
                  setCity('');
                  setArea('');
                  setDescription('');
                  setPhoneOverride('');
                  setImgErrors(new Set());
                }}
                variant="outline"
                className="font-semibold"
              >
                List Another Car
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Car Details Form ── */}
        {!submitted && (
          <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${listingId ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Section Header */}
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Car Details</h2>
                <p className="text-xs text-gray-500">Fill in all the details about your vehicle</p>
              </div>
              {listingId && (
                <span className="ml-auto inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
            </div>

            <div className="p-4 md:p-5 space-y-5">
              {/* Vehicle Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">1</span>
                  Vehicle Information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="make" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Make</Label>
                    <select id="make" value={makeId} onChange={(e) => { setMakeId(e.target.value); setModelId(''); }} className={selectClass}>
                      <option value="">Select make</option>
                      {makes.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</Label>
                    <select id="model" value={modelId} onChange={(e) => setModelId(e.target.value)} className={selectClass} disabled={!makeId}>
                      <option value="">{makeId ? 'Select model' : 'Select make first'}</option>
                      {models.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</Label>
                    <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2022" min={1950} max={new Date().getFullYear() + 1} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="condition" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</Label>
                    <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className={selectClass}>
                      <option value="used">Used</option>
                      <option value="reconditioned">Reconditioned</option>
                      <option value="new">New</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">2</span>
                  Specifications
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (BDT)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 3500000" min={0} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mileage" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mileage (km)</Label>
                    <Input id="mileage" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 45000" min={0} className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuel Type</Label>
                    <select id="fuel" value={fuel} onChange={(e) => setFuel(e.target.value as Fuel)} className={selectClass}>
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
                    <Label htmlFor="transmission" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transmission</Label>
                    <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value as Transmission)} className={selectClass}>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="cvt">CVT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">3</span>
                  Location
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Dhaka" className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</Label>
                    <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Gulshan-1" className="border-gray-200 focus:border-primary focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              {/* Description & Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">4</span>
                  Description & Contact
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your car — condition, features, service history, reason for selling..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400">{description.length}/4000 characters</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone-override" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Phone <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Input
                      id="phone-override"
                      value={phoneOverride}
                      onChange={(e) => setPhoneOverride(e.target.value)}
                      placeholder="e.g. 01711234567"
                      className="border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                    <p className="text-xs text-gray-400">
                      Leave empty to use the phone from your account profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={createDraft}
                  disabled={creating || !makeId || !modelId || !year || !price || !mileage || !city || !area || !description}
                  className="w-full bg-primary hover:bg-purple-800 text-white font-semibold py-5 text-base shadow-sm"
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save & Continue to Photos'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {listingId && !submitted && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Photos</h2>
                <p className="text-xs text-gray-500">Upload {MIN_PHOTOS}–{MAX_PHOTOS} high-quality images of your car</p>
              </div>
              <span className="ml-auto text-sm font-semibold text-gray-500">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </div>

            <div className="p-4 md:p-5 space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    {photos.length < MIN_PHOTOS
                      ? `${MIN_PHOTOS - photos.length} more photo${MIN_PHOTOS - photos.length !== 1 ? 's' : ''} required`
                      : 'Minimum requirement met'}
                  </span>
                  <span className={`text-xs font-bold ${photos.length >= MIN_PHOTOS ? 'text-green-600' : 'text-gray-400'}`}>
                    {photos.length}/{MIN_PHOTOS} min
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      photos.length >= MIN_PHOTOS ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{ width: `${photoProgress}%` }}
                  />
                </div>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.url}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${
                        idx === 0 ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      {!imgErrors.has(idx) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photo.url}
                          alt={`Photo ${idx + 1}`}
                          onError={() => setImgErrors((prev) => new Set(prev).add(idx))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          COVER
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add More Button (inline in grid) */}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      {uploading ? (
                        <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px] font-semibold text-gray-400 group-hover:text-primary">ADD</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Upload Dropzone (when no photos yet) */}
              {photos.length === 0 && (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-10 text-center cursor-pointer hover:bg-purple-50/50 transition-all"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">Uploading photos...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Click to upload photos
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG up to 10MB each. Select multiple files at once.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onUploadPhotos}
                disabled={uploading}
                className="hidden"
              />

              {/* Tips */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Photo tips for faster sales:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    First photo becomes the cover — use a front 3/4 angle
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    Include exterior, interior, dashboard, engine, and tire shots
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    Shoot in daylight with a clean background
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={onSubmitForReview}
                disabled={submitting || photos.length < MIN_PHOTOS}
                className={`w-full font-semibold py-5 text-base shadow-sm ${
                  photos.length >= MIN_PHOTOS
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : photos.length < MIN_PHOTOS ? (
                  `Upload ${MIN_PHOTOS - photos.length} more photo${MIN_PHOTOS - photos.length !== 1 ? 's' : ''} to submit`
                ) : (
                  'Submit Listing for Review'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
