import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SearchPage, type SearchParams } from "@/components/SearchPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("rentTitle"), description: t("rentSubtitle") };
}

export default async function RentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  return <SearchPage locale={locale} searchParams={sp} listingType="rent" />;
}
