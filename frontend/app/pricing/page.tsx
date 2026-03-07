import Link from 'next/link';

export const metadata = {
  title: 'Pricing - carMates',
  description:
    'Simple pricing for drivers and dealers using carMates, Bangladesh’s trusted car marketplace.'
};

const tiers = [
  {
    name: 'Browse Free',
    audience: 'For drivers exploring the market',
    price: '৳0',
    period: 'forever',
    highlight: 'Best for first-time buyers',
    features: [
      'Browse all live listings',
      'Save favorites and compare later',
      'Basic search and filters',
      'Email support'
    ]
  },
  {
    name: 'Sell Basic',
    audience: 'For individual sellers',
    price: '৳0',
    period: 'per listing',
    highlight: 'Only pay upgrade fees if you choose',
    featured: true,
    features: [
      'Create and manage your own listings',
      'Upload photos and edit details anytime',
      'Status control: draft, pending, live, sold',
      'Priority review for new listings',
      'Optional paid boosts (coming soon)'
    ]
  },
  {
    name: 'Dealer Workspace',
    audience: 'For showrooms and traders',
    price: 'Let’s talk',
    period: '',
    highlight: 'Tailored for growing dealerships',
    features: [
      'Multi-listing management dashboard',
      'Lead tracking and contact details',
      'Support for branches and team members',
      'Featured placement options',
      'Account manager & priority support'
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="space-y-10">
      {/* Hero: match carbg + purple overlay */}
      <section
        className="relative overflow-hidden px-6 py-16 md:px-10 md:py-20 text-white rounded-3xl"
        style={{
          backgroundImage: 'url(\"/images/carbg.jpg\")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-purple-600/80 to-purple-700/85 rounded-3xl" />
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Simple pricing • No surprises
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Start free, grow when you&apos;re ready.
            </h1>
            <p className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed">
              Browsing and creating basic listings on carMates is free. Dealership
              tools and promotion options are available when you need them.
            </p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-3xl border text-sm ${
              tier.featured
                ? 'border-purple-500 bg-white shadow-lg shadow-purple-100/80'
                : 'border-purple-100 bg-white/95 shadow-sm'
            } p-6 sm:p-7`}
          >
            <div className="mb-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">
                {tier.name}
              </p>
              <p className="text-xs text-gray-500">{tier.audience}</p>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-semibold text-gray-900">
                {tier.price}
                {tier.period && (
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    / {tier.period}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-purple-700 font-medium">
                {tier.highlight}
              </p>
            </div>
            <ul className="flex-1 space-y-2 text-gray-700 mb-5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2 items-start">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-1">
              {tier.name === 'Browse Free' && (
                <Link
                  href="/cars"
                  className="inline-flex w-full items-center justify-center rounded-full border border-purple-200 px-4 py-2.5 text-xs font-medium text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  Start browsing
                </Link>
              )}
              {tier.name === 'Sell Basic' && (
                <Link
                  href="/sell"
                  className="inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-colors"
                >
                  List your car
                </Link>
              )}
              {tier.name === 'Dealer Workspace' && (
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-full border border-purple-500 px-4 py-2.5 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  Talk to our team
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Note */}
      <section className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/70 px-4 py-4 sm:px-6 sm:py-5 text-[11px] sm:text-xs text-purple-900/90">
        Pricing on this page is for guidance only and may change as we add new
        features. If you&apos;re a dealer or partner with specific needs, reach
        out via the{' '}
        <Link href="/contact" className="font-medium text-purple-700 underline">
          contact page
        </Link>
        .
      </section>
    </div>
  );
}

