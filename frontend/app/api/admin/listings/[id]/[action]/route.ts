import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

interface RouteParams {
  params: { id: string; action: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id, action } = params;

  if (action !== 'approve' && action !== 'reject' && action !== 'status') {
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  }

  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const init: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    let body: Record<string, unknown> | undefined;
    if (action === 'reject') {
      const data = await request.json().catch(() => null);
      body = (data ?? {}) as Record<string, unknown>;
      init.body = JSON.stringify(body);
    } else if (action === 'status') {
      const data = (await request.json().catch(() => null)) as { status?: string } | null;
      body = data ?? {};
      init.body = JSON.stringify(body);
    }

    const url =
      action === 'status'
        ? `${API_BASE}/admin/listings/${id}/status`
        : `${API_BASE}/admin/listings/${id}/${action}`;
    const response = await fetch(url, init);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to perform action' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id, action } = params;

  if (action !== 'delete') {
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  }

  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_BASE}/admin/listings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to delete listing' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

