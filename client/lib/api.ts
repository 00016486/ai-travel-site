const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8888";

export function getApiBase() {
  return API_BASE;
}

export async function getJsonOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} failed with status ${res.status}`);
  return (await res.json()) as T;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`API ${path} failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const message = await res
      .json()
      .catch(() => ({ error: `API ${path} failed with status ${res.status}` }));
    throw new Error(message.error || `API ${path} failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

