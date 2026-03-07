import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-slate-100">
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-indigo-500" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Brand block — logo only + tagline, badges */}
        <div className="rounded-2xl bg-white/5 border border-white/10 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.png"
              alt="carMates"
              className="h-11 w-auto object-contain flex-shrink-0 rounded-lg"
            />
            <p className="text-sm text-slate-300 max-w-xs">
              Smarter way to buy and sell cars in Bangladesh.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1.5 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified listings
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/25 text-purple-200 text-xs font-medium px-3 py-1.5 border border-purple-400/30">
              Chat with sellers
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Explore */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              Explore
            </h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-slate-200 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/cars" className="text-slate-200 hover:text-white transition-colors">
                Buy Cars
              </Link>
              <Link href="/sell" className="text-slate-200 hover:text-white transition-colors">
                Sell Cars
              </Link>
              <Link href="/pricing" className="text-slate-200 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* For buyers */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              For buyers
            </h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/favorites" className="text-slate-200 hover:text-white transition-colors">
                Favorites
              </Link>
              <Link href="/about" className="text-slate-200 hover:text-white transition-colors">
                Why carMates?
              </Link>
              <Link href="/contact" className="text-slate-200 hover:text-white transition-colors">
                Help & support
              </Link>
            </nav>
          </div>

          {/* For sellers */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              For sellers
            </h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/sell" className="text-slate-200 hover:text-white transition-colors">
                List your car
              </Link>
              <Link href="/my-listings" className="text-slate-200 hover:text-white transition-colors">
                My listings
              </Link>
              <Link href="/pricing" className="text-slate-200 hover:text-white transition-colors">
                Dealer plans
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              Contact
            </h3>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex gap-2">
                <Mail className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <span>hello@carmates.com.bd</span>
              </div>
              <div className="flex gap-2">
                <Phone className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <span>+880 (123) 456-7890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-purple-900/60 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            &copy; {currentYear} carMates. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-slate-100 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-100 transition-colors">
              Terms of Service
            </Link>
            <Link href="/account" className="hover:text-slate-100 transition-colors">
              My Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
