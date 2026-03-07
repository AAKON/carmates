import { cookies } from 'next/headers';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function serverApiFetch<T>(
  path: string,
  options: { auth?: boolean; init?: RequestInit } = {}
): Promise<T> {
  const token =
    options.auth === true ? cookies().get('auth_token')?.value : undefined;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options.init,
    headers: {
      'Content-Type': 'application/json',
      ...(options.init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: 'no-store'
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

