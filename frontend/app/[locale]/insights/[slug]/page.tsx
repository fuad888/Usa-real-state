import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { MediaFrame } from "@/components/MediaFrame";
import { Navbar } from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import { getArticle, getArticles } from "@/lib/api";
import { articleExcerpt, articleTitle, dateLabel, localized, paragraphs } from "@/lib/format";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const lang = locale as Locale;
  return {
    title: articleTitle(article, lang),
    description: articleExcerpt(article, lang),
    alternates: { canonical: `/${locale}/insights/${slug}` },
    openGraph: { type: "article", publishedTime: article.published_at },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;

  const article = await getArticle(slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "insights" });
  const others = (await getArticles()).filter((a) => a.slug !== slug).slice(0, 3);
  const body = localized(article as unknown as Record<string, unknown>, "body", lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleTitle(article, lang),
    description: articleExcerpt(article, lang),
    datePublished: article.published_at,
    author: article.author ? { "@type": "Person", name: article.author.name } : undefined,
    publisher: { "@type": "Organization", name: "Sol & Stone" },
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <Link
          href="/insights"
          className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-gold"
        >
          ← {t("backToAll")}
        </Link>

        <article className="mx-auto mt-8 max-w-3xl">
          <p className="eyebrow text-gold">{t(`category.${article.category}`)}</p>
          <h1 className="display mt-4 text-4xl sm:text-5xl">{articleTitle(article, lang)}</h1>
          <p className="mt-4 text-sm text-taupe">
            {article.author ? `${t("by", { name: article.author.name })} · ` : ""}
            {dateLabel(article.published_at, lang)} · {t("readTime", { minutes: article.read_minutes })}
          </p>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-warm-white-alt">
            <MediaFrame
              src={article.cover_image}
              seed={`insight-${article.slug}`}
              alt={articleTitle(article, lang)}
              priority
              sizes="(max-width:1024px) 100vw, 768px"
            />
          </div>

          <p className="mt-10 font-serif text-2xl font-light leading-snug text-soft-black/90">
            {articleExcerpt(article, lang)}
          </p>

          <div className="mt-8 space-y-5 text-[1.02rem] leading-[1.75] text-soft-black/85">
            {paragraphs(body).map((p, i) => (
              <p key={i}>{p.replace(/\*\*/g, "")}</p>
            ))}
          </div>
        </article>

        {others.length > 0 && (
          <section className="mx-auto mt-20 max-w-3xl border-t border-taupe/20 pt-12">
            <h2 className="eyebrow text-taupe">{t("more")}</h2>
            <ul className="mt-6 space-y-5">
              {others.map((a) => (
                <li key={a.slug} className="border-b border-taupe/15 pb-5 last:border-0">
                  <Link href={`/insights/${a.slug}`} className="group block">
                    <p className="eyebrow text-gold">{t(`category.${a.category}`)}</p>
                    <h3 className="mt-1.5 font-serif text-2xl font-light transition-colors group-hover:text-gold">
                      {articleTitle(a, lang)}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
