"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

const PRICES_BUY = [500_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000];
const PRICES_RENT = [3_000, 5_000, 8_000, 12_000, 20_000, 35_000];
const TYPES = ["single_family", "condo", "townhome", "estate"] as const;

function label(v: number) {
  return v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${(v / 1000).toFixed(0)}K`;
}

/** MVP filter set from spec §5.2. Phase-2 filters are noted, not shipped. */
export function FilterPanel({ listingType }: { listingType: "buy" | "rent" }) {
  const t = useTranslations("search");
  const types = useTranslations("propertyType");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const prices = listingType === "rent" ? PRICES_RENT : PRICES_BUY;

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const active = useMemo(
    () =>
      ["search", "price_min", "price_max", "beds", "baths", "type", "sqft_min", "sqft_max"].filter(
        (k) => params.get(k),
      ).length,
    [params],
  );

  const field = "w-full border border-taupe/30 bg-warm-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none";
  const legend = "eyebrow mb-2 block text-taupe";

  const body = (
    <div className="grid gap-5">
      <div>
        <label className={legend} htmlFor="f-search">
          {t("location")}
        </label>
        <input
          id="f-search"
          defaultValue={params.get("search") ?? ""}
          placeholder={t("locationPlaceholder")}
          onChange={(e) => set("search", e.target.value)}
          className={field}
        />
      </div>

      <fieldset>
        <legend className={legend}>{t("priceRange")}</legend>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label={t("min")}
            value={params.get("price_min") ?? ""}
            onChange={(e) => set("price_min", e.target.value)}
            className={field}
          >
            <option value="">{t("min")}</option>
            {prices.map((p) => (
              <option key={p} value={p}>
                {label(p)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("max")}
            value={params.get("price_max") ?? ""}
            onChange={(e) => set("price_max", e.target.value)}
            className={field}
          >
            <option value="">{t("max")}</option>
            {prices.map((p) => (
              <option key={p} value={p}>
                {label(p)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={legend} htmlFor="f-beds">
            {t("beds")}
          </label>
          <select
            id="f-beds"
            value={params.get("beds") ?? ""}
            onChange={(e) => set("beds", e.target.value)}
            className={field}
          >
            <option value="">{t("any")}</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={legend} htmlFor="f-baths">
            {t("baths")}
          </label>
          <select
            id="f-baths"
            value={params.get("baths") ?? ""}
            onChange={(e) => set("baths", e.target.value)}
            className={field}
          >
            <option value="">{t("any")}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={legend} htmlFor="f-type">
          {t("propertyType")}
        </label>
        <select
          id="f-type"
          value={params.get("type") ?? ""}
          onChange={(e) => set("type", e.target.value)}
          className={field}
        >
          <option value="">{t("any")}</option>
          {TYPES.map((k) => (
            <option key={k} value={k}>
              {types(k)}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={legend}>{t("sqft")}</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            aria-label={t("sqftMin")}
            placeholder={t("sqftMin")}
            defaultValue={params.get("sqft_min") ?? ""}
            onChange={(e) => set("sqft_min", e.target.value.replace(/\D/g, ""))}
            className={field}
          />
          <input
            inputMode="numeric"
            aria-label={t("sqftMax")}
            placeholder={t("sqftMax")}
            defaultValue={params.get("sqft_max") ?? ""}
            onChange={(e) => set("sqft_max", e.target.value.replace(/\D/g, ""))}
            className={field}
          />
        </div>
      </fieldset>

      <div className="flex items-center justify-between border-t border-taupe/20 pt-4">
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-gold"
        >
          {t("clear")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-soft-black px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] text-warm-white transition-colors hover:bg-gold lg:hidden"
        >
          {t("apply")}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-taupe/80">{t("phase2Note")}</p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border border-taupe/30 px-4 py-3 text-[0.75rem] uppercase tracking-[0.16em] lg:hidden"
        aria-expanded={open}
      >
        {t("filters")}
        {active > 0 && (
          <span className="ml-2 grid h-5 w-5 place-items-center rounded-full bg-gold text-[0.65rem] text-white">
            {active}
          </span>
        )}
      </button>

      <div className="hidden lg:block">{body}</div>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-warm-white lg:hidden">
          <div className="flex items-center justify-between border-b border-taupe/20 px-5 py-4">
            <h2 className="font-serif text-2xl font-light">{t("filters")}</h2>
            <button type="button" onClick={() => setOpen(false)} className="p-2 text-2xl leading-none">
              <span className="sr-only">{t("apply")}</span>×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{body}</div>
        </div>
      )}
    </>
  );
}
