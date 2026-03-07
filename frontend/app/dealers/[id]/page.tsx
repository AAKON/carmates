import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverApiFetch } from '../../../lib/serverApi';
import { ListingCard } from '../../../components/ListingCard';

interface Dealer {
  id: string;
  userId: string;
  dealerName: string;
  address: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
  liveListingsCount: number;
}

interface DealerResponse {
  data: Dealer;
}

interface Listing {
  _id: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  coverPhotoUrl: string;
  status: string;
  fuel: string;
  transmission: string;
  condition: string;
  makeId?: { name: string };
  modelId?: { name: string };
}

interface DealerListingsResponse {
  data: {
    items: Listing[];
    total: number;
    page: number;
    limit: number;
  };
}

interface DealerPageProps {
  params: { id: string };
}

export default async function DealerPage({ params }: DealerPageProps) {
  let dealer: Dealer | null = null;
  try {
    const dealerRes = await serverApiFetch<DealerResponse>(
      `/dealers/${params.id}`,
      { init: { method: 'GET' } }
    );
    dealer = dealerRes.data;
  } catch {
    return notFound();
  }

  const listingsRes = await serverApiFetch<DealerListingsResponse>(
    `/dealers/${params.id}/listings`,
    { init: { method: 'GET' } }
  );

  const items = listingsRes.data.items ?? [];

  let favoritedIds = new Set<string>();
  try {
    const idsRes = await serverApiFetch<{ data: { listingIds: string[] } }>(
      '/favorites/ids',
      { auth: true }
    );
    favoritedIds = new Set(idsRes.data?.listingIds ?? []);
  } catch {
    // Not authenticated
  }

  const location = [dealer.city, dealer.area].filter(Boolean).join(', ');
  const initials = dealer.dealerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Hero – same vibe as cars & sell: image + purple overlay, centered */}
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
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Verified Dealer • Pakistan
          </div>
          <div className="flex flex-col items-center gap-4">
            {dealer.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={dealer.logoUrl}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {dealer.dealerName}
              </h1>
              {location && (
                <p className="text-base md:text-lg text-white/95 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {location}
                </p>
              )}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white">
            {dealer.liveListingsCount} live car{dealer.liveListingsCount !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* About Section */}
        {dealer.description && (
          <section className="bg-white rounded-2xl border border-purple-200 p-6 md:p-8 shadow-lg shadow-purple-100/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">About</h2>
            </div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {dealer.description}
            </p>
          </section>
        )}

        {/* Inventory Section */}
        <section className="px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">Inventory</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                Available Cars
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {items.length > 0
                  ? `${items.length} car${items.length !== 1 ? 's' : ''} from this dealer`
                  : 'No cars available right now'}
              </p>
            </div>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Browse all cars
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
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
                  status={item.status}
                  brand={item.makeId?.name || ''}
                  model={item.modelId?.name || 'Car'}
                  initialFavorite={favoritedIds.has(item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-purple-200 p-16 text-center shadow-lg shadow-purple-100/50">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                This dealer hasn&apos;t posted any cars at the moment. Check back later or browse all cars.
              </p>
              <Link
                href="/cars"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold text-sm rounded-xl transition-all"
              >
                Browse all cars
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
