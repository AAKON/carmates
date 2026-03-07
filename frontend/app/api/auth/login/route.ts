import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      {
        success: false,
        message: data?.message || 'Login failed'
      },
      { status: res.status }
    );
  }

  const token = data?.data?.token;
  if (token) {
    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }

  return NextResponse.json(
    {
      success: true,
      user: data?.data?.user ?? null
    },
    { status: 200 }
  );
}

