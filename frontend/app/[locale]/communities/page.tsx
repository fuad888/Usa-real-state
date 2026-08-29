import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CommunityCard } from "@/components/CommunityCard";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { getCommunities } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "communities" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CommunitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "communities" });
  const communities = await getCommunities();

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-2xl">
          <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 text-taupe">{t("subtitle")}</p>
        </header>
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 70}>
              <CommunityCard community={c} />
            </Reveal>
          ))}
        </ul>
      </main>
    </>
  );
}
