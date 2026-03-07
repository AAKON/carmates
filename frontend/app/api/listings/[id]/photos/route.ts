import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

interface RouteParams {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const formData = await request.formData();

  const res = await fetch(`${API_BASE}/listings/${params.id}/photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${API_BASE}/listings/${params.id}/photos`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data, { status: res.status });
}


