import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../lib/serverApi';
import { ListingCard } from '../../components/ListingCard';
import Link from 'next/link';

interface FavoriteListing {
  _id: string;
  coverPhotoUrl: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  fuel: string;
  transmission: string;
  condition: string;
  makeId: string | { _id: string; name: string; slug: string };
  modelId: string | { _id: string; name: string; slug: string };
}

interface FavoritesResponse {
  data: {
    items: FavoriteListing[];
    total: number;
    page: number;
    limit: number;
  };
}

function getBrandName(makeId: FavoriteListing['makeId']): string {
  if (typeof makeId === 'object' && makeId?.name) return makeId.name;
  return 'Unknown';
}

function getModelName(modelId: FavoriteListing['modelId']): string {
  if (typeof modelId === 'object' && modelId?.name) return modelId.name;
  return 'Car';
}

export default async function FavoritesPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/login');
  }

  let items: FavoriteListing[] = [];
  let total = 0;

  try {
    const res = await serverApiFetch<FavoritesResponse>('/favorites', {
      auth: true,
    });
    items = res.data.items ?? [];
    total = res.data.total ?? 0;
  } catch {
    // If fetch fails, show empty state
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Hero Header – match Sell / Edit theme */}
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
            <span>Stay organised • Your saved cars</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Your Favorites, In One Place
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Shortlist the cars you love, compare them side by side, and come back any time without losing track.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Saved Cars</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {total > 0
                ? `You have ${total} saved car${total !== 1 ? 's' : ''} ready to compare`
                : 'When you tap the heart on a car, it will be saved here for later.'}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                brand={getBrandName(item.makeId)}
                model={getModelName(item.modelId)}
                initialFavorite
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-14 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved cars yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Browse cars and tap the heart icon on any listing you like. They&apos;ll all show up here so you can decide later.
            </p>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 text-white px-6 py-3 text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Browse cars to save
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
