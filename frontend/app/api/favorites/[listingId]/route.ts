import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

interface RouteParams {
  params: { listingId: string };
}

export async function POST(_request: Request, { params }: RouteParams) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const res = await fetch(`${API_BASE}/favorites/${params.listingId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const res = await fetch(`${API_BASE}/favorites/${params.listingId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

