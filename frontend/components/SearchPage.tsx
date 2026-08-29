import { getTranslations, setRequestLocale } from "next-intl/server";

import { getProperties, type PropertyQuery } from "@/lib/api";

import { FilterPanel } from "./FilterPanel";
import { Navbar } from "./Navbar";
import { SearchResults } from "./SearchResults";

export type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim() : undefined;
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const v = one(value);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function buildQuery(sp: SearchParams, listingType: "buy" | "rent"): PropertyQuery {
  return {
    listing_type: listingType,
    search: one(sp.search),
    price_min: toNumber(sp.price_min),
    price_max: toNumber(sp.price_max),
    beds: toNumber(sp.beds),
    baths: toNumber(sp.baths),
    type: one(sp.type),
    sqft_min: toNumber(sp.sqft_min),
    sqft_max: toNumber(sp.sqft_max),
    community: one(sp.community),
    ordering: one(sp.ordering),
  };
}

/** Shared by /buy and /rent — the only difference is listing_type (spec §5.5). */
export async function SearchPage({
  locale,
  searchParams,
  listingType,
}: {
  locale: string;
  searchParams: SearchParams;
  listingType: "buy" | "rent";
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "search" });
  const properties = await getProperties(buildQuery(searchParams, listingType));

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1500px] px-5 pb-24 pt-10 sm:px-8">
        <header className="mb-8">
          <h1 className="display text-4xl sm:text-5xl">
            {listingType === "rent" ? t("rentTitle") : t("buyTitle")}
          </h1>
          <p className="mt-3 max-w-xl text-taupe">
            {listingType === "rent" ? t("rentSubtitle") : t("buySubtitle")}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <h2 className="sr-only">{t("filters")}</h2>
            <FilterPanel listingType={listingType} />
          </aside>
          <SearchResults properties={properties} listingType={listingType} />
        </div>
      </main>
    </>
  );
}
