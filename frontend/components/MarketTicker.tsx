import { getTranslations } from "next-intl/server";

import { getTicker } from "@/lib/api";

/**
 * The live market strip between navbar and hero (spec §4.2).
 * Data comes from FastAPI /ai/ticker — manually curated weekly in the demo,
 * FRED + MLS in Phase 1. The marquee pauses on hover and stops entirely under
 * prefers-reduced-motion.
 */
export async function MarketTicker() {
  const [data, t] = await Promise.all([getTicker(), getTranslations("ticker")]);
  const items = data.items ?? [];
  if (!items.length) return null;

  const row = (
    <ul className="flex shrink-0 items-center" aria-hidden={false}>
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="opacity-70">{item.label}:</span>
          <span className="ml-1.5 font-medium">{item.value}</span>
          {item.change ? (
            <span
              className={`ml-1.5 text-[0.68rem] ${
                item.trend === "up"
                  ? "text-[#9ec49a]"
                  : item.trend === "down"
                    ? "text-[#e0b48c]"
                    : "opacity-60"
              }`}
            >
              {item.change}
            </span>
          ) : null}
          <span aria-hidden className="mx-6 opacity-40">
            •
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      // z-index keeps the strip painted over a hero that is pulled up beneath it
      className="relative z-40 bg-ticker text-ticker-text"
      style={{ height: "var(--ticker-h)" }}
      role="region"
      aria-label={t("label")}
    >
      <div className="relative flex h-full items-center overflow-hidden">
        <div className="marquee-track flex w-max items-center text-[0.78rem] tracking-[0.12em]">
          {row}
          {/* duplicated so the -50% translate loops seamlessly */}
          {row}
        </div>
      </div>
    </div>
  );
}
