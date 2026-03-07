import Link from 'next/link';

export const metadata = {
  title: 'About carMates',
  description:
    'Learn about the mission, story, and team behind carMates — Bangladesh’s trusted marketplace for buying and selling cars.'
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      {/* Hero: match main carbg + purple gradient vibe */}
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
            About carMates • Our story
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Making car buying and selling feel calmer in Bangladesh.
            </h1>
            <p className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed">
              One focused marketplace for cars only — designed so drivers and
              dealers can connect without the noise of generic classifieds.
            </p>
          </div>
        </div>
      </section>

      {/* Grid: story / how it works / values */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white/95 border border-purple-100/80 shadow-sm p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Our story
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            carMates grew out of helping friends buy and sell cars the hard way:
            juggling screenshots, chats, and posts. We wanted one place that felt
            calmer and more trustworthy.
          </p>
        </div>
        <div className="rounded-2xl bg-white/95 border border-purple-100/80 shadow-sm p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            What we do
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            We connect real drivers and dealers with verified listings, clear
            statuses, and simple tools for browsing, listing, and managing cars.
          </p>
        </div>
        <div className="rounded-2xl bg-white/95 border border-purple-100/80 shadow-sm p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Where we&apos;re going
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            We&apos;re iterating with feedback from people on the ground —
            drivers, dealers, and enthusiasts across Bangladesh.
          </p>
        </div>
      </section>

      {/* Two-column: for drivers / for dealers */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/95 border border-purple-100/80 shadow-sm p-6 sm:p-7 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">
            For drivers
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Save favorites, come back later, and see honest status labels — so you
            can explore options without pressure.
          </p>
        </div>
        <div className="rounded-3xl bg-white/95 border border-purple-100/80 shadow-sm p-6 sm:p-7 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">
            For dealers
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Manage your stock, leads, and listing statuses in one place that feels
            modern and simple to use.
          </p>
        </div>
      </section>

      {/* CTA strip */}
      <section className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/70 px-6 py-8 sm:px-10 sm:py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-900">
              Want to help shape carMates?
            </p>
            <p className="text-sm text-purple-900/80">
              We&apos;re always open to feedback, ideas, and partnerships.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-all"
          >
            Talk to the team
          </Link>
        </div>
      </section>
    </div>
  );
}



