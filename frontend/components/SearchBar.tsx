"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";

/** Hero search: location text plus the Buy/Rent toggle (spec §5.1). */
export function SearchBar({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(`/${mode}${q ? `?search=${encodeURIComponent(q)}` : ""}`);
  };

  const hero = variant === "hero";

  return (
    <form
      onSubmit={submit}
      role="search"
      className={hero ? "w-full max-w-2xl" : "w-full"}
      aria-label={t("search")}
    >
      <div
        role="group"
        className={`mb-3 inline-flex overflow-hidden border ${
          hero ? "border-warm-white/40" : "border-taupe/30"
        }`}
      >
        {(["buy", "rent"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
              mode === m
                ? hero
                  ? "bg-warm-white text-soft-black"
                  : "bg-soft-black text-warm-white"
                : hero
                  ? "text-warm-white/90 hover:bg-warm-white/10"
                  : "text-taupe hover:text-soft-black"
            }`}
          >
            {m === "buy" ? t("buyToggle") : t("rentToggle")}
          </button>
        ))}
      </div>

      <div
        className={`flex items-stretch border ${
          hero ? "border-warm-white/40 bg-soft-black/25 backdrop-blur-sm" : "border-taupe/30 bg-warm-white"
        }`}
      >
        <label htmlFor="hero-search" className="sr-only">
          {t("searchPlaceholder")}
        </label>
        <input
          id="hero-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`min-w-0 flex-1 bg-transparent px-4 py-4 text-[0.95rem] focus:outline-none ${
            hero
              ? "text-warm-white placeholder:text-warm-white/65"
              : "text-soft-black placeholder:text-taupe"
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 px-7 text-[0.72rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
            hero
              ? "bg-warm-white text-soft-black hover:bg-gold hover:text-white"
              : "bg-soft-black text-warm-white hover:bg-gold"
          }`}
        >
          {t("search")}
        </button>
      </div>
    </form>
  );
}
