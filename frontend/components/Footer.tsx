import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { Logo } from "./Logo";

/** Equal Housing logo + statement are a legal requirement in the US (spec §18). */
function EqualHousingMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Equal Housing Opportunity"
         fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 22 24 8l20 14" strokeLinejoin="round" />
      <path d="M9 21v18h30V21" strokeLinejoin="round" />
      <path d="M17 39V28h14v11" strokeLinejoin="round" />
      <path d="M17 33h14" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contact = useTranslations("contact");
  const brand = useTranslations("brand");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-taupe/20 bg-warm-white-alt">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="text-[1.05rem]">
              <Logo />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-taupe">
              {brand("shortDescription")}
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic leading-relaxed text-taupe">
              {contact("office")
                .split("\n")
                .map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              <a className="mt-3 block hover:text-gold" href={`tel:${contact("phone").replace(/[^\d+]/g, "")}`}>
                {contact("phone")}
              </a>
              <a className="block hover:text-gold" href={`mailto:${contact("email")}`}>
                {contact("email")}
              </a>
            </address>
          </div>

          <nav className="md:col-span-2" aria-label={t("explore")}>
            <h2 className="eyebrow text-taupe">{t("explore")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(["buy", "rent", "sell", "communities"] as const).map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="hover:text-gold">
                    {nav(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label={t("company")}>
            <h2 className="eyebrow text-taupe">{t("company")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(["agents", "insights", "about", "contact"] as const).map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="hover:text-gold">
                    {nav(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="eyebrow text-taupe">{t("newsletterTitle")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-taupe">{t("newsletterBody")}</p>
            <form className="mt-5 flex max-w-sm gap-0" action="/contact">
              <label className="sr-only" htmlFor="footer-email">
                {t("newsletterPlaceholder")}
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                placeholder={t("newsletterPlaceholder")}
                className="min-w-0 flex-1 border border-taupe/35 bg-transparent px-3 py-2.5 text-sm placeholder:text-taupe/70 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="border border-l-0 border-taupe/35 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                {t("newsletterCta")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-taupe/20 pt-8 md:flex-row md:items-start md:gap-10">
          <EqualHousingMark className="h-10 w-10 shrink-0 text-taupe" />
          <p className="max-w-3xl text-xs leading-relaxed text-taupe">
            <span className="eyebrow mr-2 text-soft-black">{t("equalHousing")}</span>
            {t("equalHousingStatement")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-taupe/20 pt-6 text-xs text-taupe md:flex-row md:items-center md:justify-between">
          <p>
            {t("rights", { year })} · {t("dre")}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {(["privacy", "terms", "accessibility", "fairHousing", "dmca"] as const).map((k) => (
              <li key={k}>
                <Link href="/about" className="hover:text-gold">
                  {t(k)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-[0.68rem] uppercase tracking-[0.14em] text-taupe/70">
          {t("demoNotice")}
        </p>
      </div>
    </footer>
  );
}
