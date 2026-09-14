import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentCard } from "@/components/AgentCard";
import { CommunityCard } from "@/components/CommunityCard";
import { CountUp } from "@/components/CountUp";
import { Hero } from "@/components/Hero";
import { MediaFrame } from "@/components/MediaFrame";
import { MarketTicker } from "@/components/MarketTicker";
import { Navbar } from "@/components/Navbar";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Reveal } from "@/components/Reveal";
import { SearchBar } from "@/components/SearchBar";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { Link } from "@/i18n/navigation";
import { getAgents, getArticles, getCommunities, getProperties } from "@/lib/api";
import { articleExcerpt, articleTitle, dateLabel } from "@/lib/format";
import type { Locale } from "@/lib/types";

const PATH_CARDS = [
  { href: "/buy", key: "buy" },
  { href: "/sell", key: "sell" },
  { href: "/communities", key: "communities" },
] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const [featured, newest, communities, agents, articles] = await Promise.all([
    getProperties({ is_featured: true }),
    getProperties({ ordering: "-created_at" }),
    getCommunities(),
    getAgents(),
    getArticles(),
  ]);

  const lang = locale as Locale;

  return (
    <>
      <Navbar overHero />
      <MarketTicker />
      <main id="main" className="page-in">
        <Hero
          seed="sol-stone-home"
          alt={t("heroTitle")}
          image="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=2400&q=80&auto=format&fit=crop"
        >
          <p className="eyebrow text-gold-soft">{t("heroEyebrow")}</p>
          <h1 className="display mt-4 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-warm-white/85">
            {t("heroSubtitle")}
          </p>
          <div className="mt-9">
            <SearchBar />
          </div>
        </Hero>

        {/* Three ways to begin */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <h2 className="eyebrow text-taupe">{t("pathsTitle")}</h2>
          </Reveal>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {PATH_CARDS.map((card, i) => (
              <Reveal as="li" key={card.href} delay={i * 80}>
                <Link href={card.href} className="group zoom-parent block">
                  <div className="relative aspect-[5/4] overflow-hidden bg-warm-white-alt">
                    <MediaFrame
                      seed={`path-${card.key}`}
                      alt={t(`${card.key}CardTitle`)}
                      label={t(`${card.key}CardTitle`)}
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="zoom-target"
                    />
                  </div>
                  <h3 className="mt-5 font-serif text-3xl font-light">
                    {t(`${card.key}CardTitle`)}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-taupe">
                    {t(`${card.key}CardBody`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em] text-gold">
                    {t("search")}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* Featured */}
        <section className="border-t border-taupe/15 bg-warm-white-alt/60">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold">{t("featuredEyebrow")}</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">{t("featuredTitle")}</h2>
              </div>
              <Link
                href="/buy"
                className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors duration-300 hover:text-gold"
              >
                {t("featuredLink")} →
              </Link>
            </Reveal>
            <PropertyGrid properties={featured.slice(0, 6)} />
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <Reveal>
            <h2 className="eyebrow text-taupe">{t("statsTitle")}</h2>
          </Reveal>
          <dl className="mt-8 grid grid-cols-2 gap-8 border-t border-taupe/20 pt-8 lg:grid-cols-4">
            {[
              { label: t("statVolume"), value: 862, prefix: "$", suffix: "M" },
              { label: t("statHomes"), value: 383, suffix: "" },
              { label: t("statDom"), value: 31, suffix: "" },
              { label: t("statYears"), value: 15, suffix: "" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe">{s.label}</dt>
                <dd className="display mt-2 text-4xl sm:text-5xl">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* New listings */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <Reveal className="mb-10">
            <p className="eyebrow text-gold">{t("newEyebrow")}</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">{t("newTitle")}</h2>
          </Reveal>
          <PropertyGrid properties={newest.slice(0, 3)} />
        </section>

        {/* Communities */}
        <section className="border-t border-taupe/15">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold">{t("communitiesCardTitle")}</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">{t("pathsTitle")}</h2>
              </div>
            </Reveal>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communities.slice(0, 3).map((c, i) => (
                <Reveal as="li" key={c.slug} delay={i * 80}>
                  <CommunityCard community={c} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-taupe/15 bg-warm-white-alt/60">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <p className="eyebrow text-gold">{t("testimonialsEyebrow")}</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{t("testimonialsTitle")}</h2>
            </Reveal>
            <Reveal delay={80}>
              <TestimonialCarousel />
            </Reveal>
          </div>
        </section>

        {/* Meet an agent */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-start">
            <Reveal>
              <p className="eyebrow text-gold">{t("agentEyebrow")}</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{t("agentTitle")}</h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-taupe">{t("agentBody")}</p>
              <Link
                href="/agents"
                className="mt-7 inline-block border border-soft-black/25 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                {t("agentLink")}
              </Link>
            </Reveal>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {agents.slice(0, 3).map((a, i) => (
                <Reveal as="li" key={a.slug} delay={i * 70}>
                  <AgentCard agent={a} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Insights */}
        <section className="border-t border-taupe/15">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold">{t("insightsEyebrow")}</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">{t("insightsTitle")}</h2>
              </div>
              <Link
                href="/insights"
                className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors duration-300 hover:text-gold"
              >
                {t("insightsLink")} →
              </Link>
            </Reveal>
            <ul className="grid gap-8 sm:grid-cols-3">
              {articles.slice(0, 3).map((a, i) => (
                <Reveal as="li" key={a.slug} delay={i * 70}>
                  <Link
                    href={`/insights/${a.slug}`}
                    className="group zoom-parent block"
                  >
                    <div className="relative aspect-[8/5] overflow-hidden bg-warm-white-alt">
                      <MediaFrame
                        src={a.cover_image}
                        seed={`insight-${a.slug}`}
                        alt={articleTitle(a, lang)}
                        sizes="(max-width:640px) 100vw, 33vw"
                        className="zoom-target"
                      />
                    </div>
                    <p className="eyebrow mt-4 text-gold">{dateLabel(a.published_at, lang)}</p>
                    <h3 className="mt-2 font-serif text-2xl font-light leading-snug">
                      {articleTitle(a, lang)}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-taupe">
                      {articleExcerpt(a, lang)}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
