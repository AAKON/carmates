'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  listingId: string;
  initial?: boolean;
  compact?: boolean;
}

export function FavoriteButton({
  listingId,
  initial = false,
  compact = false
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${listingId}`, {
        method: saved ? 'DELETE' : 'POST'
      });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        // ignore error for MVP
        return;
      }
      setSaved(!saved);
      // Optionally refresh favorites page
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`text-xs rounded-full px-2 py-1 border font-medium transition-colors ${
          saved
            ? 'border-amber-400 text-amber-600 bg-amber-50'
            : 'border-white/70 text-white hover:border-white hover:bg-white/10'
        }`}
      >
        {saved ? '♥ Saved' : '♡ Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-3 py-2 text-sm border font-medium transition-colors w-full ${
        saved
          ? 'border-amber-400 text-amber-600 bg-amber-50'
          : 'border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
      }`}
    >
      {saved ? '♥ Saved to favorites' : '♡ Save to favorites'}
    </button>
  );
}

