'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Mail, Lock, User, ArrowRight, Building2, ShieldCheck, Clock, BadgeCheck } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'dealer'>(
    'individual'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          account_type: accountType
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
                    Create account
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Register to save favorites and list cars.
                  </p>
                </div>
                <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100">
                  <Car className="h-5 w-5 text-purple-700" />
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 grid grid-cols-2 rounded-2xl bg-gray-50 border border-gray-200 p-1">
                <Link
                  href="/login"
                  className="rounded-xl text-gray-600 hover:text-gray-900 text-sm font-semibold py-2 text-center transition-colors"
                >
                  Login
                </Link>
                <span className="rounded-xl bg-white text-gray-900 text-sm font-semibold py-2 text-center shadow-sm">
                  Register
                </span>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="mt-5">
                <Label>Account type</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      accountType === 'individual'
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User
                        className={`h-4 w-4 ${
                          accountType === 'individual'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      />
                      <span className="text-sm font-semibold">
                        Individual
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-[11px] ${
                        accountType === 'individual'
                          ? 'text-white/80'
                          : 'text-gray-500'
                      }`}
                    >
                      Buy & sell your own cars
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('dealer')}
                    className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      accountType === 'dealer'
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2
                        className={`h-4 w-4 ${
                          accountType === 'dealer'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      />
                      <span className="text-sm font-semibold">Dealer</span>
                    </div>
                    <p
                      className={`mt-1 text-[11px] ${
                        accountType === 'dealer'
                          ? 'text-white/80'
                          : 'text-gray-500'
                      }`}
                    >
                      Showrooms & dealerships
                    </p>
                  </button>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-11 rounded-2xl pl-10"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                  <p className="text-[11px] text-gray-500">
                    Use at least 8 characters. Add a number or symbol for
                    stronger security.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 rounded-2xl pl-10 pr-24"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Creating…' : 'Create account'}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>
              </form>
            </div>

            {/* Illustration side */}
            <div className="hidden md:block border-l border-gray-200 bg-gradient-to-b from-purple-50 to-white">
              <div className="h-full p-8 flex flex-col">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Why join?
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  List cars. Save favorites. Get approved.
                </h2>
                <p className="mt-2 text-sm text-gray-600 max-w-sm">
                  Individuals can sell cars, dealers can publish stock, and
                  admins keep quality high with listing review.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    { icon: Clock, title: 'Fast signup', body: 'No long forms—just essentials' },
                    { icon: ShieldCheck, title: 'Protected', body: 'Secure auth with tokens' },
                    { icon: BadgeCheck, title: 'Moderated', body: 'Listings reviewed for trust' }
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
                        Start listing today
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload photos, set a price, and submit for review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-gray-900 underline underline-offset-4 hover:opacity-90">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

