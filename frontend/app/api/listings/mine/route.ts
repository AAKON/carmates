import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function GET(request: Request) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const search = url.search ? url.search : '';

  const res = await fetch(`${API_BASE}/listings/mine/all${search}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

