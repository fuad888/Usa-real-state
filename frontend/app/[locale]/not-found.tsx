import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto flex min-h-[52vh] max-w-2xl flex-col justify-center px-5 py-24 text-center sm:px-8">
        <p className="eyebrow text-gold">404</p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">{t("notFound")}</h1>
        <p className="mt-4 text-taupe">{t("notFoundBody")}</p>
        <Link
          href="/"
          className="mx-auto mt-8 inline-block border border-soft-black/25 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          {t("backHome")}
        </Link>
      </main>
    </>
  );
}
