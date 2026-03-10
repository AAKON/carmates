import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'carMates - Buy & Sell Cars Online',
  description: 'Browse thousands of verified car listings from trusted dealers and private sellers. Easy, secure, and transparent car shopping.'
};

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-purple-100/80 bg-white/90 backdrop-blur-xl">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500" />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-10 md:h-11 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <div className="h-9 w-20 bg-gray-200 rounded-full animate-pulse mx-1" />
            <div className="h-9 w-20 bg-gray-200 rounded-full animate-pulse mx-1" />
            <div className="h-9 w-20 bg-gray-200 rounded-full animate-pulse mx-1" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="page-shell">
        <Suspense fallback={<NavbarFallback />}>
          <Navbar />
        </Suspense>
        <main className="page-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

