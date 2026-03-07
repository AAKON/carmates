const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface ApiError extends Error {
  status?: number;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      (data && (data.message || data.error)) || 'Request failed'
    ) as ApiError;
    err.status = res.status;
    throw err;
  }

  return data as T;
}

