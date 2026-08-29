import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MediaFrame } from "@/components/MediaFrame";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { getArticles } from "@/lib/api";
import { articleExcerpt, articleTitle, dateLabel } from "@/lib/format";
import type { Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;
  const t = await getTranslations({ locale, namespace: "insights" });
  const articles = await getArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-2xl">
          <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 text-taupe">{t("subtitle")}</p>
        </header>

        {lead ? (
          <Reveal className="mt-14">
            <Link href={`/insights/${lead.slug}`} className="group zoom-parent grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-[16/10] overflow-hidden bg-warm-white-alt">
                <MediaFrame
                  src={lead.cover_image}
                  seed={`insight-${lead.slug}`}
                  alt={articleTitle(lead, lang)}
                  priority
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="zoom-target"
                />
              </div>
              <div>
                <p className="eyebrow text-gold">
                  {t(`category.${lead.category}`)} · {dateLabel(lead.published_at, lang)}
                </p>
                <h2 className="display mt-4 text-3xl sm:text-4xl">{articleTitle(lead, lang)}</h2>
                <p className="mt-4 max-w-lg leading-relaxed text-taupe">
                  {articleExcerpt(lead, lang)}
                </p>
                <span className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.16em] text-gold">
                  {t("readMore")} · {t("readTime", { minutes: lead.read_minutes })}
                </span>
              </div>
            </Link>
          </Reveal>
        ) : null}

        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 70}>
              <Link href={`/insights/${a.slug}`} className="group zoom-parent block">
                <div className="relative aspect-[8/5] overflow-hidden bg-warm-white-alt">
                  <MediaFrame
                    src={a.cover_image}
                    seed={`insight-${a.slug}`}
                    alt={articleTitle(a, lang)}
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="zoom-target"
                  />
                </div>
                <p className="eyebrow mt-4 text-gold">{t(`category.${a.category}`)}</p>
                <h2 className="mt-2 font-serif text-2xl font-light leading-snug">
                  {articleTitle(a, lang)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-taupe">{articleExcerpt(a, lang)}</p>
                <p className="mt-3 text-xs text-taupe/80">
                  {dateLabel(a.published_at, lang)} · {t("readTime", { minutes: a.read_minutes })}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </main>
    </>
  );
}
