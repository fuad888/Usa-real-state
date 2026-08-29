"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Property, PropertyImage, TourScene } from "@/lib/types";

import { MediaFrame } from "./MediaFrame";
import { TourViewer } from "./TourViewer";

/**
 * Listing gallery (spec §5.3): a hero frame with a thumbnail rail, a full
 * lightbox, and the "View in 360°" entry point sitting right beside it.
 */
export function Gallery({
  property,
  images,
  scenes,
}: {
  property: Property;
  images: PropertyImage[];
  scenes: TourScene[];
}) {
  const t = useTranslations("listing");
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [tour, setTour] = useState(false);

  const total = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (total ? (i + delta + total) % total : 0)),
    [total],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  const active = images[index];
  const seedFor = (img: PropertyImage | undefined, i: number) =>
    `${property.slug}-${img?.room || i}`;

  return (
    <>
      <div className="relative">
        <div className="relative aspect-[16/9] overflow-hidden bg-warm-white-alt">
          <MediaFrame
            src={active?.url}
            seed={seedFor(active, index)}
            alt={active?.caption || `${property.address}, ${property.city}`}
            label={active?.room || property.address}
            sublabel={`${property.city}, ${property.state}`}
            priority
            sizes="(max-width:1024px) 100vw, 66vw"
          />

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {total > 0 && (
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="border border-warm-white/60 bg-soft-black/45 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] text-warm-white backdrop-blur-sm transition-colors duration-300 hover:bg-soft-black/70"
              >
                {t("viewAllPhotos", { count: total })}
              </button>
            )}
            {scenes.length > 0 && (
              <button
                type="button"
                onClick={() => setTour(true)}
                className="inline-flex items-center gap-2 border border-gold bg-gold/15 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] text-warm-white backdrop-blur-sm transition-colors duration-300 hover:bg-gold hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <ellipse cx="12" cy="12" rx="9.5" ry="4.5" />
                  <path d="M12 3.2a9.5 4.5 0 0 0 0 17.6" />
                  <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                </svg>
                {t("viewIn360")}
              </button>
            )}
          </div>
        </div>

        {total > 1 && (
          <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <li key={img.id ?? i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  aria-label={img.caption || img.room || t("photoOf", { index: i + 1, total })}
                  className={`relative block h-20 w-28 overflow-hidden transition-opacity duration-300 sm:h-24 sm:w-36 ${
                    i === index ? "ring-1 ring-gold" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <MediaFrame
                    src={img.url}
                    seed={seedFor(img, i)}
                    alt=""
                    label={img.room}
                    labelClassName="text-[0.62rem] tracking-[0.14em]"
                    sizes="160px"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lightbox &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("viewAllPhotos", { count: total })}
            className="fixed inset-0 z-[80] flex flex-col bg-soft-black/97"
          >
          <div className="flex items-center justify-between px-5 py-4 text-warm-white sm:px-8">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-warm-white/70">
              {t("photoOf", { index: index + 1, total })}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="border border-warm-white/30 px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-warm-white transition-colors duration-300 hover:border-warm-white"
            >
              {t("closeGallery")}
            </button>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-4 sm:inset-8">
              <div className="relative h-full w-full overflow-hidden">
                <MediaFrame
                  src={active?.url}
                  seed={seedFor(active, index)}
                  alt={active?.caption || ""}
                  label={active?.room}
                  sublabel={active?.caption}
                  sizes="100vw"
                />
              </div>
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("previous")}
                  className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-warm-white/10 text-warm-white backdrop-blur-sm transition-colors hover:bg-warm-white/25 sm:left-4"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("next")}
                  className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-warm-white/10 text-warm-white backdrop-blur-sm transition-colors hover:bg-warm-white/25 sm:right-4"
                >
                  →
                </button>
              </>
            )}
          </div>

            <p className="px-6 pb-6 text-center text-sm text-warm-white/70">{active?.caption}</p>
          </div>,
          document.body,
        )}

      {tour && scenes.length > 0 && (
        <TourViewer
          scenes={scenes}
          title={`${property.address}, ${property.city}`}
          onClose={() => setTour(false)}
        />
      )}
    </>
  );
}
