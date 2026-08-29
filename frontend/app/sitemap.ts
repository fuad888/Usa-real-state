import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getAgents, getArticles, getCommunities, getProperties } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Generated sitemap covering both locales (spec §8). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, communities, agents, articles] = await Promise.all([
    getProperties(),
    getCommunities(),
    getAgents(),
    getArticles(),
  ]);

  const staticPaths = ["", "/buy", "/rent", "/sell", "/communities", "/agents", "/insights",
                       "/about", "/contact"];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE}/${locale}${path}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const p of properties) {
      entries.push({
        url: `${SITE}/${locale}/listings/${p.slug}`,
        lastModified: p.created_at,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
    for (const c of communities) {
      entries.push({ url: `${SITE}/${locale}/communities/${c.slug}`, priority: 0.8 });
    }
    for (const a of agents) {
      entries.push({ url: `${SITE}/${locale}/agents/${a.slug}`, priority: 0.6 });
    }
    for (const a of articles) {
      entries.push({
        url: `${SITE}/${locale}/insights/${a.slug}`,
        lastModified: a.published_at,
        priority: 0.6,
      });
    }
  }
  return entries;
}
