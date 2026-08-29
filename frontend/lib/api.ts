/**
 * Data access for the demo (spec §12).
 *
 * Everything goes through the Django REST API first. If that call fails — the
 * backend is not running, a cold container, a network blip — we fall back to
 * `demo-data.json`, a snapshot of the same seed data produced by
 * `manage.py dump_demo_json`. That keeps `next build` and the client pitch
 * working when only the frontend is up; in production the API is authoritative
 * and the fallback simply never fires.
 */
import demo from "./demo-data.json";
import type {
  Agent,
  Article,
  Community,
  Property,
  TickerPayload,
  ValuationResult,
} from "./types";

export const DJANGO_API =
  process.env.NEXT_PUBLIC_DJANGO_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api";
export const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL?.replace(/\/$/, "") ?? "http://localhost:8001";

const REVALIDATE = 300;

const snapshot = demo as unknown as {
  properties: Property[];
  agents: Agent[];
  communities: Community[];
  insights: Article[];
};

type Paged<T> = { results?: T[] } | T[];

function unwrap<T>(payload: Paged<T>): T[] {
  return Array.isArray(payload) ? payload : (payload.results ?? []);
}

async function get<T>(path: string, fallback: T, revalidate = REVALIDATE): Promise<T> {
  try {
    const res = await fetch(`${DJANGO_API}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// --------------------------------------------------------------------------- //
// Filtering. Applied server-side by DRF; repeated here so the fallback snapshot
// answers the same questions the API would.
// --------------------------------------------------------------------------- //
export type PropertyQuery = {
  listing_type?: "buy" | "rent";
  city?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
  beds?: number;
  baths?: number;
  type?: string;
  sqft_min?: number;
  sqft_max?: number;
  community?: string;
  agent?: string;
  is_featured?: boolean;
  status?: string;
  ordering?: string;
};

function matches(p: Property, q: PropertyQuery): boolean {
  const needle = (q.search ?? q.city ?? "").trim().toLowerCase();
  if (needle) {
    const hay = `${p.address} ${p.city} ${p.zip_code} ${p.neighborhood} ${p.community_name ?? ""}`;
    if (!hay.toLowerCase().includes(needle)) return false;
  }
  if (q.listing_type && p.listing_type !== q.listing_type) return false;
  if (q.status && p.status !== q.status) return false;
  if (q.community && p.community_slug !== q.community) return false;
  if (q.agent && p.agent_slug !== q.agent) return false;
  if (q.is_featured && !p.is_featured) return false;
  if (q.price_min && p.price < q.price_min) return false;
  if (q.price_max && p.price > q.price_max) return false;
  if (q.beds && p.bedrooms < q.beds) return false;
  if (q.baths && p.bathrooms < q.baths) return false;
  if (q.type && p.property_type !== q.type) return false;
  if (q.sqft_min && p.square_footage < q.sqft_min) return false;
  if (q.sqft_max && p.square_footage > q.sqft_max) return false;
  return true;
}

function sortLocally(list: Property[], ordering?: string): Property[] {
  if (!ordering) return list;
  const desc = ordering.startsWith("-");
  const key = (desc ? ordering.slice(1) : ordering) as keyof Property;
  return [...list].sort((a, b) => {
    const av = a[key] as unknown as number | string;
    const bv = b[key] as unknown as number | string;
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
  });
}

function toSearchParams(q: PropertyQuery): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === "" || v === false) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function getProperties(q: PropertyQuery = {}): Promise<Property[]> {
  const fallback = sortLocally(
    snapshot.properties.filter((p) => matches(p, q)),
    q.ordering,
  );
  const data = await get<Paged<Property>>(`/properties/${toSearchParams(q)}`, fallback);
  return unwrap(data);
}

export async function getProperty(slug: string): Promise<Property | null> {
  const fallback = snapshot.properties.find((p) => p.slug === slug) ?? null;
  if (!fallback) {
    // Not in the snapshot: it can only exist upstream (e.g. added via admin).
    try {
      const res = await fetch(`${DJANGO_API}/properties/${slug}/`, {
        next: { revalidate: REVALIDATE },
      });
      return res.ok ? ((await res.json()) as Property) : null;
    } catch {
      return null;
    }
  }
  return get<Property | null>(`/properties/${slug}/`, fallback);
}

export async function getAgents(): Promise<Agent[]> {
  return unwrap(await get<Paged<Agent>>("/agents/", snapshot.agents));
}

export async function getAgent(slug: string): Promise<Agent | null> {
  const fallback = snapshot.agents.find((a) => a.slug === slug) ?? null;
  return get<Agent | null>(`/agents/${slug}/`, fallback);
}

export async function getCommunities(): Promise<Community[]> {
  return unwrap(await get<Paged<Community>>("/communities/", snapshot.communities));
}

export async function getCommunity(slug: string): Promise<Community | null> {
  const fallback = snapshot.communities.find((c) => c.slug === slug) ?? null;
  return get<Community | null>(`/communities/${slug}/`, fallback);
}

export async function getArticles(): Promise<Article[]> {
  return unwrap(await get<Paged<Article>>("/insights/", snapshot.insights));
}

export async function getArticle(slug: string): Promise<Article | null> {
  const fallback = snapshot.insights.find((a) => a.slug === slug) ?? null;
  return get<Article | null>(`/insights/${slug}/`, fallback);
}

// --------------------------------------------------------------------------- //
// FastAPI services
// --------------------------------------------------------------------------- //
const TICKER_FALLBACK: TickerPayload = {
  updated_at: "",
  source: "static",
  items: [
    { label: "Median CA Home Price", value: "$875,400", change: "+2.1% YoY", trend: "up" },
    { label: "30-Yr Fixed Rate", value: "6.42%", change: "-0.08 WoW", trend: "down" },
    { label: "Avg. Days on Market", value: "34", change: "-3 MoM", trend: "down" },
    { label: "Price / Sq Ft", value: "$612", change: "+1.4% YoY", trend: "up" },
    { label: "Active Listings, LA County", value: "9,842", change: "+5.6% MoM", trend: "up" },
    { label: "Months of Supply", value: "2.7", change: "flat", trend: "flat" },
  ],
};

export async function getTicker(): Promise<TickerPayload> {
  try {
    const res = await fetch(`${FASTAPI_URL}/ai/ticker`, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as TickerPayload;
  } catch {
    return TICKER_FALLBACK;
  }
}

export type ValuationInput = {
  sqft: number;
  zone: string;
  condition: string;
  lot_size?: number | null;
  property_type?: string;
  year_built?: number | null;
  address?: string;
  website?: string;
};

export async function requestValuation(input: ValuationInput): Promise<ValuationResult> {
  const res = await fetch(`${FASTAPI_URL}/ai/valuation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.detail ?? "We could not complete that estimate.");
  }
  return (await res.json()) as ValuationResult;
}

export type LeadInput = {
  type: "showing" | "question" | "valuation" | "contact";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  property_slug?: string;
  preferred_date?: string;
  preferred_time?: string;
  valuation_data?: Record<string, unknown>;
  consent_marketing?: boolean;
  source_locale?: string;
  website?: string;
};

export async function submitLead(input: LeadInput): Promise<void> {
  const res = await fetch(`${DJANGO_API}/leads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      typeof detail?.detail === "string" ? detail.detail : "We could not send that just now.",
    );
  }
}
