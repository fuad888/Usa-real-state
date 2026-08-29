import type { Article, Locale, Property } from "./types";

export function money(value: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    if (value >= 1_000_000) {
      const m = value / 1_000_000;
      return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(m < 10 ? 2 : 1)}M`;
    }
    if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function priceLabel(p: Property): string {
  return p.listing_type === "rent" ? `${money(p.price)}/mo` : money(p.price);
}

export function num(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function baths(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

export function dateLabel(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Localised free-text: the admin stores EN and ES side by side (spec §7). */
export function localized(
  record: Record<string, unknown>,
  field: string,
  locale: Locale,
): string {
  const value = record[`${field}_${locale}`];
  if (typeof value === "string" && value.trim()) return value;
  const fallback = record[`${field}_en`];
  return typeof fallback === "string" ? fallback : "";
}

export function propertyDescription(p: Property, locale: Locale): string {
  return localized(p as unknown as Record<string, unknown>, "description", locale);
}

export function articleTitle(a: Article, locale: Locale): string {
  return localized(a as unknown as Record<string, unknown>, "title", locale);
}

export function articleExcerpt(a: Article, locale: Locale): string {
  return localized(a as unknown as Record<string, unknown>, "excerpt", locale);
}

export function paragraphs(body: string): string[] {
  return body.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
}

/** Resolve site-relative demo paths against the Django host when needed. */
export function mediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/demo/") || url.startsWith("/vendor/")) return url;
  if (url.startsWith("/media/")) {
    const base = (process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "http://localhost:8000/api").replace(
      /\/api\/?$/,
      "",
    );
    return `${base}${url}`;
  }
  return url;
}
