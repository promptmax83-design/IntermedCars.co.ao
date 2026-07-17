const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `Erro ${res.status}`);
  }

  return json as T;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return api<T>(path, { method: "GET" });
}

export function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  return api<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  return api<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = unknown>(path: string): Promise<T> {
  return api<T>(path, { method: "DELETE" });
}

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || `Erro ${res.status}`);
  }

  return json as T;
}
