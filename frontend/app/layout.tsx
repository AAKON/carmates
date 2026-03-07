import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="page-shell">
        <Navbar />
        <main className="page-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

