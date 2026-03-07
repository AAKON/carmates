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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'dealer'>(
    'individual'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
                  <div className="rounded-full bg-white/20 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase shadow-md border border-white/35 backdrop-blur-sm">
                    Create your carMates profile
                  </div>
                </div>
                <span className="text-xs font-medium text-white/90">
                  Live marketplace · Bangladesh
                </span>
              </div>

              <div className="mt-10 space-y-4">
                <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight">
                  Join carMates and start your next drive.
                </h1>
                <p className="text-sm text-purple-100/90 max-w-md">
                  Create a free account to compare listings, chat with sellers,
                  and track your own cars for sale in one place.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-purple-100/90">
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                    <p className="font-semibold">For drivers</p>
                    <p className="mt-1 text-[11px] text-purple-100/80">
                      Save your favorite cars, set price alerts, and keep your
                      shortlists synced across devices.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                    <p className="font-semibold">For dealers</p>
                    <p className="mt-1 text-[11px] text-purple-100/80">
                      Publish your stock, manage leads, and boost your
                      dealership visibility in minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-xs text-purple-100/85">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 border border-white/30">
                    <Car className="h-4 w-4" />
                  </div>
                  <span>New listings every day from trusted sellers.</span>
                </div>
                <span className="hidden xl:inline text-[11px]">
                  Your account can be upgraded to dealer later if needed.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: registration card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-6 text-center lg:text-left space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Create your carMates account
            </h2>
            <p className="text-sm text-gray-600">
              It only takes a minute to get started.
            </p>
          </div>

          <Card className="border-purple-100/80 bg-white/95 backdrop-blur-sm shadow-lg shadow-purple-100/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Choose your account type
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                You can switch between individual and dealer later in your
                account settings.
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
                  <Label>Account type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['individual', 'dealer'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`flex flex-col items-start rounded-2xl border px-3.5 py-3 text-left text-xs sm:text-sm transition-all ${
                          accountType === type
                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <span className="font-semibold">
                          {type === 'individual' ? 'Individual' : 'Dealer'}
                        </span>
                        <span className="mt-0.5 text-[11px] text-gray-500">
                          {type === 'individual'
                            ? 'For buying and selling your own cars'
                            : 'For showrooms, traders, and dealerships'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-gray-500">
                    Use at least 8 characters, including a number and a symbol.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading ? 'Creating…' : 'Create account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

