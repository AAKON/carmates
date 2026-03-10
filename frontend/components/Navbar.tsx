'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, User, LogOut, Settings, Heart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Buy Cars' }
];

const moreLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' }
];

const userMenuLinks = [
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/my-listings', label: 'My Listings', icon: FileText },
  { href: '/account', label: 'Account', icon: Settings }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
   const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [user, setUser] = useState<{ role?: string; profileImageUrl?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data.success && data.data?.user ? data.data.user : null);
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    // Close the More dropdown when route changes
    setMoreMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // Sell Cars always visible: goes to /login when not logged in, /sell when logged in
  const navLinks = [
    ...publicLinks,
    { href: user ? '/sell' : '/login', label: 'Sell Cars', activeOnlyWhen: '/sell' },
    { href: '/pricing', label: 'Pricing' }
  ];
  const isAdmin = user?.role === 'admin';

  const editingMyListingUnderSell =
    pathname?.startsWith('/cars') &&
    (searchParams.get('mine') === '1' || searchParams.get('mine') === 'true') &&
    (searchParams.get('edit') === '1' || searchParams.get('edit') === 'true');

  return (
    <header className="sticky top-0 z-50 border-b border-purple-100/80 bg-white/90 backdrop-blur-xl">
      {/* Accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90"
          >
            <img
              src="/images/logo.png"
              alt="carMates"
              className="h-10 md:h-11 w-auto object-contain rounded-lg"
            />
            <span className="sr-only">carMates</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 border border-purple-50 shadow-sm">
            {navLinks.map((link) => {
              let active =
                'activeOnlyWhen' in link && link.activeOnlyWhen
                  ? pathname === link.activeOnlyWhen
                  : link.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(link.href);

              if (editingMyListingUnderSell) {
                if (link.label === 'Buy Cars') active = false;
                if (link.label === 'Sell Cars') active = true;
              }
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* More dropdown (About, Contact) */}
            <div className="relative ml-1">
              {(() => {
                const isMoreActive =
                  pathname?.startsWith('/about') || pathname?.startsWith('/contact');
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        isMoreActive || moreMenuOpen
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                          : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      More
                    </button>
                    {moreMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-40">
                        <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Explore
                        </p>
                        {moreLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {authChecked && (
              <>
                {user ? (
                  <>
                    {isAdmin && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hidden sm:inline-flex text-sm font-semibold rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <Link href="/admin">Admin</Link>
                      </Button>
                    )}

                    <div className="relative hidden sm:block">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 text-purple-700 hover:from-purple-200 hover:to-purple-100 transition-all border border-purple-100 shadow-sm overflow-hidden"
                        title="Account menu"
                      >
                        {user?.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </button>

                      {userMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            aria-hidden
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50">
                            <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Account
                            </p>
                            {userMenuLinks.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                  <Icon className="w-4 h-4 text-purple-500" />
                                  {link.label}
                                </Link>
                              );
                            })}
                            <div className="border-t border-purple-100 my-1.5" />
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                handleLogout();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-full font-semibold text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-200"
                    >
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-purple-100 bg-gradient-to-b from-purple-50/90 to-white py-4 px-3 space-y-1">
            {navLinks.map((link) => {
              let active =
                'activeOnlyWhen' in link && link.activeOnlyWhen
                  ? pathname === link.activeOnlyWhen
                  : link.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(link.href);

              if (editingMyListingUnderSell) {
                if (link.label === 'Buy Cars') active = false;
                if (link.label === 'Sell Cars') active = true;
              }
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* More group on mobile */}
            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              More
            </p>
            {moreLinks.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-purple-200 pt-4 mt-4 space-y-1">
              {user ? (
                <>
                  {userMenuLinks.map((link) => {
                    const Icon = link.icon;
                    const active =
                      link.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-purple-500" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {isAdmin && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-xl text-sm font-semibold border-purple-200 hover:bg-purple-50"
                    >
                      <Link href="/admin" onClick={() => setMenuOpen(false)}>
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl text-sm font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="w-full justify-start rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

