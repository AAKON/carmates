'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-stretch justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr,0.9fr] gap-10 lg:gap-16 items-center">
        {/* Left: brand / illustration panel */}
        <div className="relative hidden lg:block h-full">
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl shadow-purple-200/70 border border-purple-100/80 bg-gradient-to-br from-purple-700 via-purple-600 to-fuchsia-500">
            <div
              className="absolute inset-0 opacity-55 mix-blend-soft-light"
              style={{
                backgroundImage: 'url("/images/carbg.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10 text-white">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg ring-1 ring-white/50 flex items-center justify-center min-h-[52px]">
                    <img
                      src="/images/logo.png"
                      alt="carMates"
                      className="h-10 w-auto object-contain max-w-[140px]"
                    />
                  </div>
                  <a
                    href="#"
                    className="rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-md border border-white/30 transition-colors"
                  >
                    Secure sign in
                  </a>
                </div>
                <span className="text-xs font-medium text-white/90">
                  Live marketplace · Bangladesh
                </span>
              </div>

              <div className="mt-10 space-y-4">
                <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight">
                  Sign in and pick up where you left off.
                </h1>
                <p className="text-sm text-purple-100/90 max-w-md">
                  Access saved searches, favorites, and your listings in one
                  place. Manage your car journey with a seamless, trusted
                  experience.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-purple-100/90">
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                    <p className="font-semibold">Verified listings</p>
                    <p className="mt-1 text-[11px] text-purple-100/80">
                      All cars are reviewed by our team for quality and
                      transparency.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                    <p className="font-semibold">Smart alerts</p>
                    <p className="mt-1 text-[11px] text-purple-100/80">
                      Get notified when new cars match your preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-xs text-purple-100/85">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 border border-white/30">
                    <Car className="h-4 w-4" />
                  </div>
                  <span>Thousands of active carMates users every month.</span>
                </div>
                <span className="hidden xl:inline text-[11px]">
                  Your data is encrypted and never shared without consent.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-6 text-center lg:text-left space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back to carMates
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to manage your favorites, listings, and account.
            </p>
          </div>

          <Card className="border-purple-100/80 bg-white/95 backdrop-blur-sm shadow-lg shadow-purple-100/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Use the email and password you registered with carMates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                By continuing you agree to our{' '}
                <span className="font-medium text-purple-600 hover:text-purple-700">
                  Terms
                </span>{' '}
                and{' '}
                <span className="font-medium text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </span>
                .
              </p>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Create one in seconds
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

