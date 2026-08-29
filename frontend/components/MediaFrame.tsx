import Image from "next/image";

import { mediaUrl } from "@/lib/format";

import { LogoMark } from "./Logo";

/**
 * The single place the demo decides "photo or placeholder".
 *
 * Listing photography is not licensed yet (spec §14), so every image field in
 * the seed data is blank and this component paints a branded CSS gradient with
 * the subject's name instead. The moment a real URL or upload exists — added
 * through the Django admin in Phase 1 — the same component renders the photo,
 * so no page needs to change.
 */

const PALETTES = [
  ["#EAE3D8", "#C6BBA9"], // warm stone
  ["#D8CEC1", "#A09486"], // taupe
  ["#D5D9CF", "#98A293"], // sage
  ["#E6D5C6", "#BB9881"], // clay
  ["#D3D7D9", "#9BA4A7"], // marine slate
  ["#F0E4CD", "#CBB080"], // gold sand
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function placeholderStyle(seed: string, dark = false): React.CSSProperties {
  const h = hash(seed);
  const [from, to] = PALETTES[h % PALETTES.length];
  const angle = 120 + (h % 5) * 24;
  if (dark) {
    return {
      backgroundImage: `linear-gradient(${angle}deg, #2A2724 0%, #4A4239 55%, ${to} 160%)`,
    };
  }
  return {
    backgroundImage:
      `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%),` +
      `radial-gradient(120% 90% at 78% 18%, rgba(255,255,255,0.42), transparent 60%)`,
    backgroundBlendMode: "multiply",
  };
}

export function MediaFrame({
  src,
  alt,
  seed,
  label,
  sublabel,
  sizes = "(max-width:640px) 100vw, 33vw",
  priority = false,
  className = "",
  labelClassName = "",
}: {
  src?: string | null;
  alt: string;
  seed: string;
  label?: string;
  sublabel?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  labelClassName?: string;
}) {
  if (src) {
    return (
      <Image
        src={mediaUrl(src)}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 flex flex-col items-center justify-center px-5 text-center ${className}`}
      style={placeholderStyle(seed)}
    >
      <LogoMark className="h-5 w-auto text-soft-black/25" />
      {label ? (
        <p
          className={`mt-3 font-serif text-lg font-light uppercase leading-tight tracking-[0.18em] text-soft-black/55 ${labelClassName}`}
        >
          {label}
        </p>
      ) : null}
      {sublabel ? (
        <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-soft-black/35">
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
