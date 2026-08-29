import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { ValuationChatWidget } from "@/components/ValuationChatWidget";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sell" });
  return { title: t("heroTitle"), description: t("heroBody") };
}

const STEPS = ["step1", "step2", "step3", "step4", "step5"] as const;
const SERVICES = ["service1", "service2", "service3", "service4"] as const;

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "sell" });

  return (
    <>
      <Navbar overHero />
      <main id="main" className="page-in">
        <Hero seed="sol-stone-sell" alt={t("heroTitle")} height="short">
          <p className="eyebrow text-gold-soft">{t("heroEyebrow")}</p>
          <h1 className="display mt-4 max-w-3xl text-[2.4rem] sm:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-5 max-w-xl leading-relaxed text-warm-white/85">{t("heroBody")}</p>
        </Hero>

        {/* AI valuation assistant */}
        <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(420px,55%)] lg:items-start">
            {/* min-w-0: grid items default to min-width:auto and would otherwise
                be sized by their content rather than the track (spec §9.4) */}
            <Reveal className="min-w-0">
              <h2 className="display text-3xl sm:text-4xl">{t("assistantTitle")}</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-taupe">{t("heroBody")}</p>
              <ol className="mt-8 space-y-4 text-sm text-taupe">
                {[t("q1"), t("q2"), t("q3"), t("q4")].map((q, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-serif text-lg text-gold">{i + 1}</span>
                    <span className="pt-1">{q}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={80} className="min-w-0">
              <ValuationChatWidget />
            </Reveal>
          </div>
        </section>

        {/* Process */}
        <section className="border-t border-taupe/15 bg-warm-white-alt/60">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
            <Reveal>
              <p className="eyebrow text-gold">{t("processEyebrow")}</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{t("processTitle")}</h2>
            </Reveal>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {STEPS.map((k, i) => (
                <Reveal as="li" key={k} delay={i * 60}>
                  <p className="font-serif text-4xl font-light text-gold/50">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 border-t border-taupe/25 pt-3 font-serif text-2xl font-light">
                    {t(k)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-taupe">{t(`${k}Body`)}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl">{t("servicesTitle")}</h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((k, i) => (
              <Reveal as="li" key={k} delay={i * 70}>
                <span aria-hidden className="rule-gold block w-14" />
                <h3 className="mt-5 font-serif text-2xl font-light">{t(k)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-taupe">{t(`${k}Body`)}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
