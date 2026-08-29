"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const KEY = "solstone.saved";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Favourites without an account (spec §5.2 / §5.9): the demo keeps them in
 * localStorage. Phase 2 replaces this with the saved-search service.
 */
export function SaveButton({
  slug,
  className = "",
  variant = "icon",
}: {
  slug: string;
  className?: string;
  variant?: "icon" | "full";
}) {
  const t = useTranslations("card");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(read().includes(slug));
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = saved ? read().filter((s) => s !== slug) : [...new Set([...read(), slug])];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode — the button still toggles for this session */
    }
    setSaved(!saved);
  };

  const heart = (
    <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" fill={saved ? "currentColor" : "none"}
         stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M12 20.2 4.8 13a4.6 4.6 0 0 1 6.5-6.5l.7.7.7-.7A4.6 4.6 0 0 1 19.2 13Z" />
    </svg>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 border px-5 py-3 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
          saved ? "border-gold text-gold" : "border-soft-black/25 hover:border-gold hover:text-gold"
        } ${className}`}
      >
        {heart}
        {saved ? t("saved") : t("save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? t("saved") : t("save")}
      className={`grid h-9 w-9 place-items-center bg-warm-white/85 text-soft-black backdrop-blur-[2px] transition-colors duration-300 hover:text-gold ${
        saved ? "text-gold" : ""
      } ${className}`}
    >
      {heart}
    </button>
  );
}
