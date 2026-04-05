export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  import.meta.env?.VITE_API_BASE ||
  "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

export async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  // DELETE 204
  if (res.status === 204) return undefined as T;

  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
  return res.json();
}
