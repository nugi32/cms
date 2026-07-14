/**
 * The public site pages fetch through the REST API (not directly through
 * cms-service), so this is the one place that knows the base URL.
 *
 * Set NEXT_PUBLIC_SITE_URL in .env.local for production / any host other
 * than localhost:3000.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function apiGetCollection(
  collection: string,
  filters: Record<string, string> = {}
): Promise<any[]> {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/api/${collection}${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function apiGetItem(
  collection: string,
  id: string
): Promise<any | null> {
  if (!id) return null;
  const res = await fetch(`${BASE_URL}/api/${collection}/${id}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}
