"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import {
  boundsOf,
  HIGHWAYS,
  LAND_POLYGON,
  PLACE_LABELS,
  project,
  type LatLng,
} from "@/lib/geo";
import { money, priceLabel } from "@/lib/format";
import type { Locale, Property } from "@/lib/types";

const VIEW_W = 1000;
const VIEW_H = 720;

/**
 * Interactive listing map (spec §5.2): markers sync with the results list, and
 * clicking a marker highlights its card. Draws its own basemap — see lib/geo.ts
 * for why, and for the Mapbox upgrade path.
 */
export function MapView({
  properties,
  activeSlug,
  onSelect,
  onHover,
  className = "",
}: {
  properties: Property[];
  activeSlug?: string | null;
  onSelect?: (slug: string | null) => void;
  onHover?: (slug: string | null) => void;
  className?: string;
}) {
  const t = useTranslations("map");
  const locale = useLocale() as Locale;
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const pins = useMemo(
    () => properties.filter((p) => p.latitude != null && p.longitude != null),
    [properties],
  );

  // Frame on the listings when we have them, otherwise on the basin itself.
  const bounds = useMemo(() => {
    const focus: LatLng[] = pins.length
      ? pins.map((p) => ({ lat: p.latitude as number, lng: p.longitude as number }))
      : [
          { lat: 34.25, lng: -119.0 },
          { lat: 33.72, lng: -118.05 },
        ];
    return boundsOf(focus, pins.length > 1 ? 0.35 : 1.6);
  }, [pins]);

  const toSvg = useCallback(
    (point: LatLng) => {
      const { x, y } = project(point);
      const sx = ((x - bounds.minX) / bounds.width) * VIEW_W;
      const sy = ((y - bounds.minY) / bounds.height) * VIEW_H;
      return { x: sx, y: sy };
    },
    [bounds],
  );

  const path = useCallback(
    (points: LatLng[], close = false) =>
      points
        .map((p, i) => {
          const { x, y } = toSvg(p);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ") + (close ? " Z" : ""),
    [toSvg],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const kx = VIEW_W / rect.width;
    const ky = VIEW_H / rect.height;
    setPan({
      x: drag.current.px + (e.clientX - drag.current.x) * kx,
      y: drag.current.py + (e.clientY - drag.current.y) * ky,
    });
  };
  const endDrag = () => {
    drag.current = null;
  };

  const zoomBy = (factor: number) => {
    setZoom((z) => Math.min(6, Math.max(0.7, z * factor)));
  };
  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const inv = 1 / zoom;

  return (
    <div className={`relative overflow-hidden bg-[#dfe3e2] ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label={t("title")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{ cursor: drag.current ? "grabbing" : "grab" }}
      >
        <defs>
          <pattern id="ss-sea" width="26" height="26" patternUnits="userSpaceOnUse">
            <rect width="26" height="26" fill="#dbe2e3" />
            <path d="M0 13h26" stroke="#cfd8d9" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#ss-sea)" />

        <g
          transform={`translate(${pan.x} ${pan.y}) translate(${VIEW_W / 2} ${VIEW_H / 2}) scale(${zoom}) translate(${-VIEW_W / 2} ${-VIEW_H / 2})`}
        >
          <path d={path(LAND_POLYGON, true)} fill="#efece5" stroke="#c9c2b6" strokeWidth={1.2 * inv} />

          {HIGHWAYS.map((h) => (
            <path
              key={h.name}
              d={path(h.points)}
              fill="none"
              stroke="#d6cfc2"
              strokeWidth={3.4 * inv}
              strokeLinecap="round"
            />
          ))}

          {PLACE_LABELS.map((label) => {
            const { x, y } = toSvg(label.at);
            const sea = label.name === "Pacific Ocean";
            return (
              <text
                key={label.name}
                x={x}
                y={y}
                fontSize={(sea ? 15 : 13) * (label.size ?? 1) * inv}
                fill={sea ? "#9aa8ab" : "#a9a29a"}
                letterSpacing={2.4 * inv}
                textAnchor="middle"
                style={{ textTransform: "uppercase", fontStyle: sea ? "italic" : "normal" }}
              >
                {label.name}
              </text>
            );
          })}

          {pins.map((p) => {
            const { x, y } = toSvg({ lat: p.latitude as number, lng: p.longitude as number });
            const active = activeSlug === p.slug;
            const label = money(p.price, { compact: true });
            const w = (label.length * 8.2 + 20) * inv;
            const h = 24 * inv;
            return (
              <g
                key={p.slug}
                transform={`translate(${x} ${y})`}
                className="cursor-pointer"
                onMouseEnter={() => onHover?.(p.slug)}
                onMouseLeave={() => onHover?.(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(p.slug);
                }}
              >
                <circle r={4 * inv} fill={active ? "#b9975b" : "#1c1b19"} />
                <g transform={`translate(0 ${-10 * inv})`}>
                  <rect
                    x={-w / 2}
                    y={-h}
                    width={w}
                    height={h}
                    rx={2 * inv}
                    fill={active ? "#b9975b" : "#1c1b19"}
                    style={{ transition: "fill 300ms" }}
                  />
                  <text
                    x={0}
                    y={-h / 2}
                    dy={4.4 * inv}
                    textAnchor="middle"
                    fontSize={12.5 * inv}
                    fill="#faf7f2"
                    letterSpacing={0.6 * inv}
                  >
                    {label}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Keyboard- and screen-reader-accessible equivalent of the markers */}
      <ul className="sr-only">
        {pins.map((p) => (
          <li key={p.slug}>
            <Link href={`/listings/${p.slug}`}>
              {t("markerLabel", { price: priceLabel(p), address: `${p.address}, ${p.city}` })}
            </Link>
          </li>
        ))}
      </ul>

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden border border-soft-black/10 bg-warm-white/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => zoomBy(1.4)}
          aria-label={t("zoomIn")}
          className="h-9 w-9 text-lg leading-none transition-colors hover:text-gold"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.4)}
          aria-label={t("zoomOut")}
          className="h-9 w-9 border-t border-soft-black/10 text-lg leading-none transition-colors hover:text-gold"
        >
          −
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label={t("reset")}
          className="h-9 w-9 border-t border-soft-black/10 transition-colors hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="mx-auto h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
          </svg>
        </button>
      </div>

      <p className="pointer-events-none absolute bottom-2 left-3 text-[0.62rem] uppercase tracking-[0.16em] text-taupe/80">
        {t("attribution")} · {locale.toUpperCase()}
      </p>
    </div>
  );
}
