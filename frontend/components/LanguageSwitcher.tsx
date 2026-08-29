"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-1 text-[0.7rem] tracking-[0.18em] uppercase ${className}`}
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((code, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-1 opacity-40">/</span>}
          <button
            type="button"
            disabled={pending}
            aria-current={code === locale ? "true" : undefined}
            onClick={() =>
              startTransition(() => {
                // Keep the current path and query when switching language (spec §7).
                // Read the query from the URL rather than useSearchParams, which
                // would opt every page containing the navbar out of prerendering.
                const qs = typeof window === "undefined" ? "" : window.location.search;
                router.replace(`${pathname}${qs}`, { locale: code });
              })
            }
            className={`transition-opacity duration-300 ${
              code === locale ? "text-gold" : "opacity-60 hover:opacity-100"
            }`}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
