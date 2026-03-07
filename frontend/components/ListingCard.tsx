'use client';

import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export interface ListingCardProps {
  id: string;
  coverPhotoUrl: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  status?: string;
  showFavorite?: boolean;
  initialFavorite?: boolean;
  brand?: string;
  model?: string;
}

export function ListingCard(props: ListingCardProps) {
  const {
    id,
    coverPhotoUrl,
    price,
    year,
    mileage,
    city,
    area,
    status,
    showFavorite = true,
    initialFavorite = false,
    brand = '',
    model = 'Car'
  } = props;

  const [imageError, setImageError] = useState(false);

  const displayBrand =
    brand && brand.trim().toLowerCase() !== 'unknown' ? brand.trim() : '';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'sold':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <Link href={`/cars/${id}`}>
      <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-400 overflow-hidden h-full flex flex-col border border-gray-200/50 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden">
          {!imageError && coverPhotoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverPhotoUrl}
              alt={`${brand} ${model}`}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover group-hover:scale-115 transition-transform duration-700"
            />
          ) : (
            /* Placeholder Image */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/carplace.png"
              alt="Car listing placeholder"
              className="h-full w-full object-cover group-hover:scale-115 transition-transform duration-700 bg-gray-300"
            />
          )}

          {/* Brand Label - Subtle */}
          {displayBrand && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-semibold">
              {displayBrand}
            </div>
          )}

          {/* Favorite Button - Top Right */}
          {showFavorite && (
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton
                listingId={id}
                initial={initialFavorite}
                compact
              />
            </div>
          )}

          {/* Price Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4">
            <p className="text-2xl font-bold text-white">
              BDT {Math.floor(price / 100000)}L
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          {/* Title & Model */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {year} {model}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              {displayBrand ? `${displayBrand} • ${city}` : city}
            </p>
          </div>

          {/* Specs - Minimal Style */}
          <div className="flex items-center justify-between gap-3 mt-4 py-3 border-y border-gray-100">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">YEAR</p>
              <p className="text-sm font-bold text-gray-900">{year}</p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">MILEAGE</p>
              <p className="text-sm font-bold text-gray-900">{(mileage / 1000).toFixed(0)}k km</p>
            </div>
          </div>

          {/* Location */}
          <div className="mt-4 flex items-start gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{city}, {area}</span>
          </div>

          {/* View Button */}
          <Button
            className="w-full mt-5 bg-primary hover:bg-purple-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            size="sm"
          >
            View Car
          </Button>
        </div>
      </div>
    </Link>
  );
}

