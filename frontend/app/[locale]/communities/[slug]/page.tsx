import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CountUp } from "@/components/CountUp";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { MapView } from "@/components/MapView";
import { Navbar } from "@/components/Navbar";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getCommunities, getCommunity, getProperties } from "@/lib/api";
import { localized, money, paragraphs } from "@/lib/format";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const communities = await getCommunities();
  return communities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const community = await getCommunity(slug);
  if (!community) return {};
  const lang = locale as Locale;
  return {
    // Local SEO: each community page targets its own phrase (spec §8)
    title: `${community.name} luxury homes for sale`,
    description: localized(community as unknown as Record<string, unknown>, "tagline", lang),
    alternates: { canonical: `/${locale}/communities/${slug}` },
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;

  const community = await getCommunity(slug);
  if (!community) notFound();

  const t = await getTranslations({ locale, namespace: "communities" });
  const properties = await getProperties({ community: slug });
  const record = community as unknown as Record<string, unknown>;
  const tagline = localized(record, "tagline", lang);
  const description = localized(record, "description", lang);
  const md = community.market_data ?? {};

  const stats = [
    md.median_price != null && {
      label: t("medianPrice"),
      value: md.median_price,
      format: "money" as const,
    },
    md.active_listings != null && { label: t("activeListings"), value: md.active_listings },
    md.median_dom != null && { label: t("medianDom"), value: md.median_dom },
    md.price_per_sqft != null && {
      label: t("pricePerSqft"),
      value: md.price_per_sqft,
      format: "money" as const,
    },
  ].filter(Boolean) as { label: string; value: number; format?: "money" }[];

  return (
    <>
      <Navbar overHero />
      <main id="main" className="page-in">
        <Hero
          image={community.hero_image || undefined}
          seed={`community-${community.slug}`}
          alt={community.name}
          height="short"
        >
          <Link
            href="/communities"
            className="text-[0.72rem] uppercase tracking-[0.16em] text-warm-white/70 transition-colors hover:text-gold-soft"
          >
            ← {t("backToAll")}
          </Link>
          <h1 className="display mt-4 text-[2.6rem] sm:text-6xl">{community.name}</h1>
          {tagline ? (
            <p className="mt-4 max-w-xl leading-relaxed text-warm-white/85">{tagline}</p>
          ) : null}
        </Hero>

        {stats.length > 0 && (
          <section className="border-b border-taupe/15">
            <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
              <h2 className="eyebrow text-taupe">{t("marketTitle")}</h2>
              <dl className="mt-6 grid grid-cols-2 gap-8 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[0.72rem] uppercase tracking-[0.14em] text-taupe">
                      {s.label}
                    </dt>
                    <dd className="display mt-2 text-3xl sm:text-4xl">
                      {s.format === "money" ? (
                        s.value >= 1_000_000 ? (
                          money(s.value, { compact: true })
                        ) : (
                          money(s.value)
                        )
                      ) : (
                        <CountUp value={s.value} />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {md.yoy_change != null ? (
                <p className="mt-6 text-sm text-taupe">
                  {t("yoy")}: <span className="text-soft-black">{md.yoy_change > 0 ? "+" : ""}{md.yoy_change}%</span>
                </p>
              ) : null}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
            <Reveal>
              <div className="max-w-2xl space-y-4 leading-relaxed text-soft-black/85">
                {paragraphs(description).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
            {community.lifestyle_info?.length ? (
              <Reveal delay={80}>
                <h2 className="eyebrow text-gold">{t("lifestyleTitle")}</h2>
                <dl className="mt-5 space-y-5">
                  {community.lifestyle_info.map((group) => (
                    <div key={group.category} className="border-t border-taupe/20 pt-4">
                      <dt className="text-[0.72rem] uppercase tracking-[0.14em] text-taupe">
                        {group.category}
                      </dt>
                      <dd className="mt-1.5 text-[0.95rem] leading-relaxed">
                        {group.items.join(" · ")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
          <h2 className="display mb-8 text-3xl sm:text-4xl">
            {t("homesTitle", { name: community.name })}
          </h2>
          {properties.length ? (
            <>
              <MapView
                properties={properties}
                className="mb-12 h-[420px] border border-taupe/20"
              />
              <PropertyGrid properties={properties} />
            </>
          ) : (
            <p className="border border-dashed border-taupe/35 px-6 py-12 text-center text-taupe">
              {t("homesEmpty")}
            </p>
          )}
        </section>

        <section className="border-t border-taupe/15 bg-warm-white-alt/60">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="display text-3xl sm:text-4xl">
                {t("ctaTitle", { name: community.name })}
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-taupe">{t("ctaBody")}</p>
            </div>
            <LeadForm type="contact" compact />
          </div>
        </section>
      </main>
    </>
  );
}
