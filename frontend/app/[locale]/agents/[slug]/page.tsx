import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { LeadForm } from "@/components/LeadForm";
import { MediaFrame } from "@/components/MediaFrame";
import { Navbar } from "@/components/Navbar";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getAgent, getAgents, getProperties } from "@/lib/api";
import { localized, paragraphs } from "@/lib/format";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const agents = await getAgents();
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const agent = await getAgent(slug);
  if (!agent) return {};
  return {
    title: `${agent.name} — ${agent.title}`,
    description: localized(agent as unknown as Record<string, unknown>, "bio", locale as Locale).slice(0, 180),
    alternates: { canonical: `/${locale}/agents/${slug}` },
  };
}

const STAT_KEYS = [
  ["total_sales_volume", "statsVolume"],
  ["homes_sold", "statsHomes"],
  ["years_experience", "statsYears"],
  ["avg_days_on_market", "statsDom"],
] as const;

export default async function AgentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;

  const agent = await getAgent(slug);
  if (!agent) notFound();

  const t = await getTranslations({ locale, namespace: "agents" });
  const listings = await getProperties({ agent: agent.slug });
  const bio = localized(agent as unknown as Record<string, unknown>, "bio", lang);

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <Link
          href="/agents"
          className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-gold"
        >
          ← {t("backToAll")}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[380px_1fr] lg:items-start">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <div className="relative aspect-[3/4] overflow-hidden bg-warm-white-alt">
              <MediaFrame
                src={agent.photo_url}
                seed={`agent-${agent.slug}`}
                alt={agent.name}
                label={agent.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
                labelClassName="text-4xl"
                priority
                sizes="(max-width:1024px) 100vw, 380px"
              />
            </div>
            <div className="mt-6 space-y-2 text-sm">
              {agent.phone ? (
                <a
                  className="block hover:text-gold"
                  href={`tel:${agent.phone.replace(/[^\d+]/g, "")}`}
                >
                  {t("call")}: {agent.phone}
                </a>
              ) : null}
              {agent.email ? (
                <a className="block break-all hover:text-gold" href={`mailto:${agent.email}`}>
                  {t("emailLabel")}: {agent.email}
                </a>
              ) : null}
              {agent.license_number ? (
                <p className="text-taupe">{agent.license_number}</p>
              ) : null}
            </div>
          </div>

          <div>
            <h1 className="display text-4xl sm:text-6xl">{agent.name}</h1>
            <p className="mt-3 text-taupe">{agent.title}</p>

            {bio ? (
              <div className="mt-8 max-w-2xl space-y-4 leading-relaxed text-soft-black/85">
                {paragraphs(bio).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : null}

            {agent.career_stats && Object.keys(agent.career_stats).length > 0 && (
              <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-taupe/20 py-8 sm:grid-cols-4">
                {STAT_KEYS.filter(([key]) => agent.career_stats[key] != null).map(([key, label]) => (
                  <div key={key}>
                    <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-taupe">
                      {t(label)}
                    </dt>
                    <dd className="mt-1.5 font-serif text-2xl font-light">
                      {String(agent.career_stats[key])}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {agent.specialties?.length ? (
                <div>
                  <h2 className="eyebrow text-gold">{t("specialties")}</h2>
                  <ul className="mt-3 space-y-1.5 text-[0.95rem]">
                    {agent.specialties.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {agent.neighborhoods?.length ? (
                <div>
                  <h2 className="eyebrow text-gold">{t("neighborhoods")}</h2>
                  <ul className="mt-3 space-y-1.5 text-[0.95rem]">
                    {agent.neighborhoods.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <Reveal className="mt-14 border border-taupe/25 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-light">
                {t("contactTitle", { name: agent.name.split(" ")[0] })}
              </h2>
              <p className="mt-2 text-sm text-taupe">
                {t("contactBody", { name: agent.name.split(" ")[0] })}
              </p>
              <div className="mt-6">
                <LeadForm type="contact" />
              </div>
            </Reveal>
          </div>
        </div>

        <section className="mt-20 border-t border-taupe/20 pt-14">
          <h2 className="display mb-10 text-3xl sm:text-4xl">{t("listings")}</h2>
          {listings.length ? (
            <PropertyGrid properties={listings} />
          ) : (
            <p className="text-taupe">{t("listingsEmpty")}</p>
          )}
        </section>
      </main>
    </>
  );
}
