'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Mail, Lock, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-white via-white to-purple-50/40">
      {/* subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="carMates"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <Card className="rounded-3xl border-gray-200 shadow-2xl shadow-purple-100/60 overflow-hidden">
          <div className="grid md:grid-cols-[1.05fr,0.95fr]">
            {/* Form side */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                    Sign in
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Welcome back—continue to your account.
                  </p>
                </div>
                <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100">
                  <Car className="h-5 w-5 text-purple-700" />
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 grid grid-cols-2 rounded-2xl bg-gray-50 border border-gray-200 p-1">
                <span className="rounded-xl bg-white text-gray-900 text-sm font-semibold py-2 text-center shadow-sm">
                  Login
                </span>
                <Link
                  href="/register"
                  className="rounded-xl text-gray-600 hover:text-gray-900 text-sm font-semibold py-2 text-center transition-colors"
                >
                  Register
                </Link>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="h-11 rounded-2xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-2xl pl-10 pr-24"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Signing in…' : 'Continue'}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>

                <p className="text-center text-xs text-gray-500">
                  By continuing you agree to our{' '}
                  <span className="font-semibold text-gray-700 hover:text-gray-900">
                    Terms
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-gray-700 hover:text-gray-900">
                    Privacy Policy
                  </span>
                  .
                </p>
              </form>
            </div>

            {/* Illustration side */}
            <div className="hidden md:block border-l border-gray-200 bg-gradient-to-b from-purple-50 to-white">
              <div className="h-full p-8 flex flex-col">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  carMates account
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Everything in one dashboard.
                </h2>
                <p className="mt-2 text-sm text-gray-600 max-w-sm">
                  Save favorites, manage listings, and access admin tools when
                  applicable—without losing your place.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    { icon: ShieldCheck, title: 'Secure sessions', body: 'Token stored in httpOnly cookie' },
                    { icon: Heart, title: 'Favorites sync', body: 'Your saved cars stay available' },
                    { icon: Sparkles, title: 'Clean UI', body: 'Fast pages with modern components' }
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.title} className="rounded-2xl border border-purple-100 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-purple-700" />
                          <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">{f.body}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <div className="rounded-2xl overflow-hidden border border-purple-100 bg-white">
                    <div
                      className="h-40 w-full"
                      style={{
                        backgroundImage: 'url("/images/carbg.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900">
                        Browse cars faster
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Use filters, compare listings, and come back anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-gray-900 underline underline-offset-4 hover:opacity-90">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

