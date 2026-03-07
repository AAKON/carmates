import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function GET() {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const res = await fetch(`${API_BASE}/account/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: Request) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();

  const res = await fetch(`${API_BASE}/account/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

