import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentCard } from "@/components/AgentCard";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getAgents } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("subtitle") };
}

const VALUES = ["value1", "value2", "value3"] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const agents = await getAgents();

  return (
    <>
      <Navbar overHero />
      <main id="main" className="page-in">
        <Hero seed="sol-stone-about" alt={t("title")} height="short">
          <h1 className="display max-w-3xl text-[2.4rem] sm:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-xl leading-relaxed text-warm-white/85">{t("subtitle")}</p>
        </Hero>

        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <h2 className="eyebrow text-gold">{t("storyTitle")}</h2>
            </Reveal>
            <Reveal delay={80} className="max-w-2xl space-y-5 text-[1.02rem] leading-[1.75] text-soft-black/85">
              <p>{t("story1")}</p>
              <p>{t("story2")}</p>
              <p>{t("story3")}</p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-taupe/15 bg-warm-white-alt/60">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
            <Reveal>
              <h2 className="display text-4xl sm:text-5xl">{t("valuesTitle")}</h2>
            </Reveal>
            <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3">
              {VALUES.map((k, i) => (
                <Reveal as="li" key={k} delay={i * 70}>
                  <span aria-hidden className="rule-gold block w-14" />
                  <h3 className="mt-5 font-serif text-2xl font-light">{t(k)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-taupe">{t(`${k}Body`)}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={i * 70}>
                <AgentCard agent={a} />
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="border-t border-taupe/15">
          <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
            <h2 className="display text-4xl sm:text-5xl">{t("ctaTitle")}</h2>
            <p className="mt-4 leading-relaxed text-taupe">{t("ctaBody")}</p>
            <Link
              href="/contact"
              className="mt-8 inline-block bg-soft-black px-8 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-warm-white transition-colors duration-300 hover:bg-gold"
            >
              {nav("cta")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
