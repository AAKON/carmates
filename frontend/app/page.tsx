import Link from 'next/link';
import { serverApiFetch } from '../lib/serverApi';
import { ListingCard } from '../components/ListingCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Car, MapPin, DollarSign, FileText, Camera, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Listing {
  _id: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  coverPhotoUrl: string;
  status: string;
  makeId?: string;
  modelId?: string;
  make?: { name: string };
  model?: { name: string };
}

interface ListingsResponse {
  data: {
    items: Listing[];
    total: number;
    page: number;
    limit: number;
  };
}

export default async function HomePage() {
  let items: Listing[] = [];
  let liveTotal = 0;
  let makes: { id: string; name: string }[] = [];
  let loadError: string | null = null;
  let favoritedIds = new Set<string>();

  try {
    const [listingsRes, makesRes] = await Promise.all([
      serverApiFetch<ListingsResponse>(
        '/listings?limit=6&sortBy=createdAt&sortOrder=desc'
      ),
      serverApiFetch<{ data: { id: string; name: string }[] }>('/meta/makes')
    ]);

    items = listingsRes.data.items ?? [];
    liveTotal = listingsRes.data.total ?? items.length;
    makes = (makesRes.data ?? []).slice(0, 12);
  } catch (err: any) {
    loadError = err?.message || 'Failed to load marketplace data.';
  }

  try {
    const idsRes = await serverApiFetch<{ data: { listingIds: string[] } }>(
      '/favorites/ids',
      { auth: true }
    );
    favoritedIds = new Set(idsRes.data?.listingIds ?? []);
  } catch {
    // Not authenticated or error — leave favoritedIds empty
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-16 md:px-10 md:py-24 text-white" style={{
        backgroundImage: 'url("/images/carbg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-purple-600/80 to-purple-700/85" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:ease-out">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Car className="w-4 h-4" />
            Live marketplace • Bangladesh
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Drive Your Next Adventure
            </h1>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Explore thousands of verified cars from trusted sellers and dealers. Find your perfect match with transparent pricing, real photos, and one-click contact.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
            <Button
              asChild
              className="bg-white text-primary hover:bg-gray-50 font-semibold"
            >
              <Link href="/cars" className="flex items-center gap-2">
                Buy cars now <ArrowRight className="w-4 h-4" />
              </Link>
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

      {/* Advanced search bar */}
      <section className="bg-gradient-to-b from-secondary to-white px-6 py-12 md:px-10">
        <Card className="max-w-5xl mx-auto bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-700"></div>
          <CardContent className="py-8 px-6 md:px-8">
            <form
              action="/cars"
              method="GET"
              className="space-y-6"
            >
              {/* Form Title */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Find your perfect car</h3>
              </div>

              {/* Search Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Brand Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="quick-make" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    Brand
                  </Label>
                  <select
                    id="quick-make"
                    name="makeId"
                    className="w-full h-[42px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-gray-300"
                    defaultValue=""
                  >
                    <option value="">All brands</option>
                    {makes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="quick-city" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    City
                  </Label>
                  <Input
                    id="quick-city"
                    name="city"
                    placeholder="Dhaka"
                    className="h-[42px] px-4 rounded-lg border border-gray-200 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-gray-300"
                  />
                </div>

                {/* Min Price Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="quick-min-price" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Min Price
                  </Label>
                  <Input
                    id="quick-min-price"
                    name="minPrice"
                    type="number"
                    min={0}
                    placeholder="500000"
                    className="h-[42px] px-4 rounded-lg border border-gray-200 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-gray-300"
                  />
                </div>

                {/* Max Price Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="quick-max-price" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Max Price
                  </Label>
                  <Input
                    id="quick-max-price"
                    name="maxPrice"
                    type="number"
                    min={0}
                    placeholder="5000000"
                    className="h-[42px] px-4 rounded-lg border border-gray-200 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-gray-300"
                  />
                </div>

                {/* Search Button */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                    &nbsp;
                  </Label>
                  <Button
                    type="submit"
                    className="w-full h-[42px] bg-gradient-to-r from-primary to-purple-700 hover:from-primary hover:to-purple-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {loadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{loadError}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Featured Stats Section */}
      <section className="px-6 py-12 md:px-10 md:py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 border-l-4 border-purple-600 shadow-lg shadow-purple-100/50 hover:shadow-xl transition-shadow">
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {liveTotal.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-2">
                Live Listings
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Verified cars ready to find their next owner
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-l-4 border-indigo-600 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-shadow">
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {makes.length}+
              </p>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-2">
                Popular Brands
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From Toyota to Tesla, all major brands featured
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-l-4 border-pink-600 shadow-lg shadow-pink-100/50 hover:shadow-xl transition-shadow">
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                1000+
              </p>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-2">
                Happy Buyers
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Trusted marketplace for genuine transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="px-6 py-12 md:px-10 md:py-16 bg-gradient-to-b from-purple-100 via-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">New</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                Latest Arrivals
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Fresh listings from verified sellers
              </p>
            </div>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {items.length === 0 && !loadError ? (
            <Card className="card-md text-center bg-white border-purple-200 shadow-lg shadow-purple-100/50">
              <CardContent>
                <p className="text-gray-600">
                  No live listings yet.{' '}
                  <Link
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                    href="/sell"
                  >
                    Be the first to list
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {items.map((item) => {
                const populatedMake: any =
                  typeof item.makeId === 'object' ? (item.makeId as any) : null;
                const populatedModel: any =
                  typeof item.modelId === 'object' ? (item.modelId as any) : null;

                const brand =
                  populatedMake?.name || item.make?.name || '';
                const model =
                  populatedModel?.name || item.model?.name || 'Car';

                return (
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
                    brand={brand}
                    model={model}
                    initialFavorite={favoritedIds.has(item._id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Browse Brands Section */}
      <section className="px-6 py-12 md:px-10 md:py-16 bg-gradient-to-b from-white via-purple-50/40 to-purple-100/40">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 border-0 shadow-xl shadow-purple-100/80 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 bg-gradient-to-r from-white to-purple-50">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide">
                    Browse by brand
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Shop by Brand
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Explore popular car brands with active listings.
                </p>
              </div>
              {makes.length > 0 && (
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-3 py-1">
                  {makes.length} active brands
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {makes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  Brands will appear here after seeding.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {makes.map((m) => (
                    <Link
                      key={m.id}
                      href={`/cars?makeId=${m.id}`}
                      className="group relative flex items-center justify-between gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md transition-all"
                    >
                      <span className="truncate group-hover:text-purple-700">
                        {m.name}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {m.name.charAt(0)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works - Full width */}
      <section className="px-6 py-12 md:px-10 md:py-16 bg-gradient-to-b from-secondary to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              How it works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and hassle-free process for selling your car
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'List your car',
                body: 'Add make, model, price, specs, and location details.'
              },
              {
                icon: Camera,
                title: 'Upload photos',
                body: 'Add 5–20 high-quality images and set your cover photo.'
              },
              {
                icon: CheckCircle,
                title: 'Get approved',
                body: 'We review for quality to ensure buyer confidence.'
              }
            ].map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <IconComponent className="w-16 h-16 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.body}
                    </p>
                    <div className="pt-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-lg">
                        {idx + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative overflow-hidden px-6 py-12 md:px-10 md:py-20 text-white"
        style={{
          backgroundImage: 'url("/images/carbottom.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-purple-600/85 to-purple-700/90" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Ready to find your next car?
          </h2>
          <p className="text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
            Join thousands of buyers and sellers on Bangladesh's most trusted car marketplace. Get the best deals on verified cars today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
            <Button
              asChild
              className="bg-white text-primary hover:bg-gray-50 font-semibold text-base shadow-lg hover:shadow-xl transition-all px-8 py-6"
            >
              <Link href="/cars" className="flex items-center gap-2">
                Start browsing now <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="border-2 border-white bg-transparent text-white hover:bg-white/20 font-semibold text-base transition-all px-8 py-6"
            >
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}


