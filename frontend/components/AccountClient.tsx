'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2 } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  account_type: string;
  status: string;
  phone?: string;
  city?: string;
  area?: string;
}

interface DealerProfile {
  dealerName: string;
  address?: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
}

interface AccountClientProps {
  user: UserProfile;
  dealerProfile: DealerProfile | null;
}

export function AccountClient({ user, dealerProfile }: AccountClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [city, setCity] = useState(user.city ?? '');
  const [area, setArea] = useState(user.area ?? '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [dealerName, setDealerName] = useState(
    dealerProfile?.dealerName ?? ''
  );
  const [dealerAddress, setDealerAddress] = useState(
    dealerProfile?.address ?? ''
  );
  const [dealerCity, setDealerCity] = useState(dealerProfile?.city ?? '');
  const [dealerArea, setDealerArea] = useState(dealerProfile?.area ?? '');
  const [dealerDescription, setDealerDescription] = useState(
    dealerProfile?.description ?? ''
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setError(null);
    setSuccess(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await fetch('/api/account/profile-image', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please make sure the backend endpoint exists.');
      }

      const data = await res.json();
      setProfileImage(data.data?.profileImageUrl || null);
      setSuccess('Profile image updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Make sure the backend endpoint /api/account/profile-image exists.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeProfileImage = async () => {
    setError(null);
    setSuccess(null);
    setUploadingImage(true);

    try {
      const res = await fetch('/api/account/profile-image', {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to remove image');
      }

      setProfileImage(null);
      setSuccess('Profile image removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    setError(null);
    setSuccess(null);
    setSavingProfile(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: phone || null,
          city: city || null,
          area: area || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update profile');
      }
      setSuccess('Profile updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveDealerProfile = async () => {
    setError(null);
    setSuccess(null);
    setSavingDealer(true);
    try {
      const res = await fetch('/api/account/dealer-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerName,
          address: dealerAddress,
          description: dealerDescription || null,
          city: dealerCity || null,
          area: dealerArea || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update dealer profile');
      }
      setSuccess('Dealer profile updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to update dealer profile');
    } finally {
      setSavingDealer(false);
    }
  };

  const isDealer = user.account_type === 'dealer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Hero Header – align with Sell / My Listings / Favorites */}
      <section
        className="relative overflow-hidden px-4 py-6 md:px-8 md:py-10 text-white"
        style={{
          backgroundImage: 'url(\"/images/carbg.jpg\")',
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
            <span>Account settings • carMates</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Your carMates profile
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Keep your contact details up to date and, if you&apos;re a dealer, manage how buyers see your showroom.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top summary card */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Account</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Update your personal profile {isDealer && 'and dealer information'}.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 px-3 py-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {user.account_type === 'dealer' ? 'Dealer account' : 'Individual account'}
            </span>
            <span className="mt-1">Status: <span className="font-medium capitalize">{user.status}</span></span>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
              error
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {error ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span>{error || success}</span>
          </div>
        )}

        <div className={`grid gap-6 ${isDealer ? 'md:grid-cols-2' : ''}`}>
          <Card className="space-y-3 text-sm">
            <CardHeader>
              <CardTitle className="font-semibold text-gray-900">
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <Label className="block text-xs font-medium text-gray-600">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-4">
                  {profileImage ? (
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        disabled={uploadingImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 disabled:opacity-50"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose image'}
                    </Button>
                    <p className="text-[10px] text-gray-500">
                      Max 5MB. JPG, PNG
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <Label className="block text-xs font-medium text-gray-600" htmlFor="profile-name">
                  Name
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="block text-xs font-medium text-gray-600" htmlFor="profile-email">
                  Email
                </Label>
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="block text-xs font-medium text-gray-600" htmlFor="profile-phone">
                    Phone
                  </Label>
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="block text-xs font-medium text-gray-600" htmlFor="profile-city">
                    City
                  </Label>
                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="block text-xs font-medium text-gray-600" htmlFor="profile-area">
                  Area
                </Label>
                <Input
                  id="profile-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                {user.account_type} · {user.status}
              </div>
              <Button
                type="button"
                disabled={savingProfile}
                onClick={saveProfile}
                size="sm"
                className="mt-1 bg-primary hover:bg-purple-800 text-white font-semibold"
              >
                {savingProfile ? 'Saving…' : 'Save profile'}
              </Button>
            </CardContent>
          </Card>

          {isDealer && (
            <Card className="space-y-3 text-sm">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900">
                  Dealer profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="block text-xs font-medium text-gray-600" htmlFor="dealer-name">
                    Dealer name
                  </Label>
                  <Input
                    id="dealer-name"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="block text-xs font-medium text-gray-600" htmlFor="dealer-address">
                    Address
                  </Label>
                  <Input
                    id="dealer-address"
                    value={dealerAddress}
                    onChange={(e) => setDealerAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="block text-xs font-medium text-gray-600" htmlFor="dealer-city">
                      City
                    </Label>
                    <Input
                      id="dealer-city"
                      value={dealerCity}
                      onChange={(e) => setDealerCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="block text-xs font-medium text-gray-600" htmlFor="dealer-area">
                      Area
                    </Label>
                    <Input
                      id="dealer-area"
                      value={dealerArea}
                      onChange={(e) => setDealerArea(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="block text-xs font-medium text-gray-600" htmlFor="dealer-description">
                    Description
                  </Label>
                  <textarea
                    id="dealer-description"
                    value={dealerDescription}
                    onChange={(e) => setDealerDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 bg-background px-3 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  type="button"
                  disabled={savingDealer}
                  onClick={saveDealerProfile}
                  size="sm"
                  className="mt-1 bg-primary hover:bg-purple-800 text-white font-semibold"
                >
                  {savingDealer ? 'Saving…' : 'Save dealer profile'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

