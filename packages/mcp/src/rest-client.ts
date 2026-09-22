const baseUrl = () => process.env.ROUTEHIRE_API_URL || "http://localhost:3000";

export async function apiGet(path: string, params?: Record<string, string>) {
  const url = new URL(path, baseUrl());
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown) {
  const url = new URL(path, baseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
