import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { MediaFrame } from "./MediaFrame";
import { localized, money } from "@/lib/format";
import type { Community, Locale } from "@/lib/types";

export function CommunityCard({ community }: { community: Community }) {
  const t = useTranslations("communities");
  const locale = useLocale() as Locale;
  const tagline = localized(community as unknown as Record<string, unknown>, "tagline", locale);
  const median = community.market_data?.median_price;

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group zoom-parent block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-warm-white-alt">
        <MediaFrame
          src={community.hero_image}
          seed={`community-${community.slug}`}
          alt={community.name}
          className="zoom-target"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-soft-black/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-6 text-warm-white">
          <h3 className="font-serif text-3xl font-light">{community.name}</h3>
          {median ? (
            <p className="mt-1 text-[0.78rem] tracking-[0.12em] text-warm-white/85">
              {t("medianPrice")} {money(median, { compact: true })} ·{" "}
              {community.active_listings} {t("activeListings").toLowerCase()}
            </p>
          ) : null}
        </div>
      </div>
      {tagline ? <p className="mt-4 text-sm leading-relaxed text-taupe">{tagline}</p> : null}
    </Link>
  );
}
