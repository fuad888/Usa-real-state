"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/buy", key: "buy" },
  { href: "/rent", key: "rent" },
  { href: "/sell", key: "sell" },
  { href: "/communities", key: "communities" },
  { href: "/agents", key: "agents" },
  { href: "/insights", key: "insights" },
  { href: "/about", key: "about" },
] as const;

/** Sticky navbar: transparent over a hero, solid once scrolled (spec §4.1). */
export function Navbar({ overHero = false }: { overHero?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = overHero && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent text-warm-white"
          : "bg-warm-white/92 text-soft-black backdrop-blur-md border-b border-taupe/15"
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 sm:px-8"
        style={{ height: "var(--nav-h)" }}
        aria-label="Primary"
      >
        <Link href="/" className="shrink-0 text-[0.95rem]" aria-label="Sol & Stone — home">
          <Logo />
        </Link>

        <ul className="ml-auto hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative text-[0.8rem] tracking-[0.06em] transition-opacity duration-300 hover:opacity-70 ${
                    active ? "opacity-100" : "opacity-80"
                  }`}
                >
                  {t(l.key)}
                  <span
                    aria-hidden
                    className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <LanguageSwitcher className="hidden sm:flex" />
          <Link
            href="/contact"
            className={`hidden whitespace-nowrap border px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 md:inline-block ${
              transparent
                ? "border-warm-white/50 hover:border-warm-white hover:bg-warm-white/10"
                : "border-soft-black/25 hover:border-gold hover:text-gold"
            }`}
          >
            {t("cta")}
          </Link>

          <button
            type="button"
            className="lg:hidden -mr-2 p-2"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t("close") : t("menu")}</span>
            <span aria-hidden className="block h-4 w-6">
              <span
                className={`block h-px w-6 bg-current transition-transform duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`mt-[6px] block h-px w-6 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`mt-[6px] block h-px w-6 bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-taupe/15 bg-warm-white text-soft-black"
        >
          <ul className="mx-auto max-w-[1400px] px-5 py-4 sm:px-8">
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-taupe/10 last:border-0">
                <Link href={l.href} className="block py-3.5 font-serif text-2xl font-light">
                  {t(l.key)}
                </Link>
              </li>
            ))}
            <li className="pt-5">
              <Link
                href="/contact"
                className="block border border-soft-black/25 px-4 py-3 text-center text-[0.72rem] uppercase tracking-[0.16em]"
              >
                {t("cta")}
              </Link>
            </li>
            <li className="pt-4">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
