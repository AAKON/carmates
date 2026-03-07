import { serverApiFetch } from '../../lib/serverApi';

interface Listing {
  _id: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  area: string;
  coverPhotoUrl: string;
  status: string;
}

interface ListingsResponse {
  data: {
    items: Listing[];
  };
}

export default async function BrowsePage() {
  const res = await serverApiFetch<ListingsResponse>('/listings', {
    init: { method: 'GET' }
  });

  const items = res.data.items ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buy cars</h1>
        <p className="text-slate-300 text-sm">
          Public, live listings from individuals and dealers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item._id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
          >
            <div className="aspect-video bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverPhotoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {item.year} · {item.mileage.toLocaleString()} km
                </span>
                <span className="text-xs uppercase tracking-wide text-emerald-400">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  {item.city}, {item.area}
                </span>
                <span className="font-semibold text-sky-400">
                  ${item.price.toLocaleString()}
                </span>
              </div>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-slate-300">
            No live listings yet. Be the first to list a car.
          </p>
        )}
      </div>
    </div>
  );
}

