"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Property } from "@/lib/types";

import { MapView } from "./MapView";
import { PropertyCard } from "./PropertyCard";

/** Split view: results list on the left, map on the right (spec §5.2). */
export function SearchResults({
  properties,
  listingType,
}: {
  properties: Property[];
  listingType: "buy" | "rent";
}) {
  const t = useTranslations("search");
  const common = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLUListElement>(null);

  const activeSlug = hovered ?? selected;

  const selectFromMap = (slug: string | null) => {
    setSelected(slug);
    if (!slug) return;
    const node = listRef.current?.querySelector(`[data-slug="${slug}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const setSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("ordering", value);
    else next.delete("ordering");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,42%)] lg:items-start">
      <div className={mobileView === "map" ? "hidden lg:block" : ""}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-taupe/20 pb-4">
          <p className="text-sm text-taupe">{t("results", { count: properties.length })}</p>
          <label className="flex items-center gap-2 text-sm">
            <span className="eyebrow text-taupe">{t("sort")}</span>
            <select
              value={params.get("ordering") ?? ""}
              onChange={(e) => setSort(e.target.value)}
              className="border border-taupe/30 bg-warm-white px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
            >
              <option value="">{t("sortNewest")}</option>
              <option value="-price">{t("sortPriceDesc")}</option>
              <option value="price">{t("sortPriceAsc")}</option>
              <option value="-square_footage">{t("sortSqft")}</option>
            </select>
          </label>
        </div>

        {properties.length === 0 ? (
          <div className="border border-dashed border-taupe/35 px-6 py-16 text-center">
            <p className="font-serif text-2xl font-light">{t("empty")}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-taupe">
              {t("emptyBody")}
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block border border-soft-black/25 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <ul ref={listRef} className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {properties.map((p, i) => (
              <li key={p.slug}>
                <PropertyCard
                  property={p}
                  priority={i < 2}
                  compact
                  active={activeSlug === p.slug}
                  onHover={setHovered}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={`lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] ${
          mobileView === "list" ? "hidden lg:block" : ""
        }`}
      >
        <MapView
          properties={properties}
          activeSlug={activeSlug}
          onSelect={selectFromMap}
          onHover={setHovered}
          className="h-[60vh] border border-taupe/20 lg:h-[calc(100vh-var(--nav-h)-4rem)]"
        />
        <p className="sr-only">{common("loading")}</p>
      </div>

      <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <div className="flex overflow-hidden border border-soft-black/15 bg-warm-white shadow-lg">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={mobileView === v}
              onClick={() => setMobileView(v)}
              className={`px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                mobileView === v ? "bg-soft-black text-warm-white" : ""
              }`}
            >
              {v === "list" ? t("showList") : t("showMap")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
