"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { baths, num, priceLabel } from "@/lib/format";
import type { Locale, Property } from "@/lib/types";

import { MediaFrame } from "./MediaFrame";
import { SaveButton } from "./SaveButton";
import { StatusBadge } from "./StatusBadge";

export function PropertyCard({
  property,
  priority = false,
  compact = false,
  active = false,
  onHover,
}: {
  property: Property;
  priority?: boolean;
  compact?: boolean;
  active?: boolean;
  onHover?: (slug: string | null) => void;
}) {
  const t = useTranslations("card");
  const locale = useLocale() as Locale;
  const cover = property.images?.[0];

  return (
    <article
      onMouseEnter={() => onHover?.(property.slug)}
      onMouseLeave={() => onHover?.(null)}
      className={`group zoom-parent transition-shadow duration-300 ${
        active ? "shadow-[0_0_0_1px_var(--color-gold)]" : ""
      }`}
      data-slug={property.slug}
    >
      <Link href={`/listings/${property.slug}`} className="block">
        <div className={`relative overflow-hidden bg-warm-white-alt ${compact ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
          <MediaFrame
            src={cover?.url}
            seed={property.slug}
            alt={cover?.caption || `${property.address}, ${property.city}`}
            label={property.address}
            sublabel={`${property.city}, ${property.state}`}
            priority={priority}
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="zoom-target"
          />

          <div className="absolute left-3 top-3 flex gap-2">
            <StatusBadge status={property.status} />
            {property.has_tour && (
              <span className="eyebrow inline-flex items-center gap-1 bg-warm-white/90 px-2.5 py-1 text-soft-black backdrop-blur-[2px]">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <ellipse cx="12" cy="12" rx="9.5" ry="4.5" />
                  <path d="M12 3.2a9.5 4.5 0 0 0 0 17.6" />
                </svg>
                360°
              </span>
            )}
          </div>

          <SaveButton slug={property.slug} className="absolute right-3 top-3" />
        </div>

        <div className="pt-4">
          <p className="font-serif text-[1.35rem] font-light leading-none">
            {priceLabel(property)}
          </p>
          <h3 className="mt-2 text-[0.92rem] leading-snug">
            {property.address}
          </h3>
          <p className="text-[0.82rem] text-taupe">
            {property.neighborhood ? `${property.neighborhood} · ` : ""}
            {property.city}, {property.state} {property.zip_code}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-taupe">
            <span>
              <span className="text-soft-black">{property.bedrooms}</span> {t("beds")}
            </span>
            <span aria-hidden className="opacity-40">|</span>
            <span>
              <span className="text-soft-black">{baths(property.bathrooms)}</span> {t("baths")}
            </span>
            <span aria-hidden className="opacity-40">|</span>
            <span>
              <span className="text-soft-black">{num(property.square_footage)}</span> {t("sqft")}
            </span>
          </p>
        </div>
      </Link>
      <span className="sr-only">{locale}</span>
    </article>
  );
}
