import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/LeadForm";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const forms = await getTranslations({ locale, namespace: "forms" });

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-2xl">
          <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 text-taupe">{t("subtitle")}</p>
        </header>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <Reveal>
            <h2 className="eyebrow text-gold">{t("formTitle")}</h2>
            <div className="mt-6">
              <LeadForm type="contact" messagePlaceholder={t("messagePlaceholder")} />
            </div>
          </Reveal>

          <Reveal delay={80} className="border border-taupe/25 p-6 sm:p-8">
            <h2 className="eyebrow text-taupe">{t("officeTitle")}</h2>
            <address className="mt-4 space-y-1 text-[0.98rem] not-italic leading-relaxed">
              {t("office")
                .split("\n")
                .map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
            </address>
            <div className="mt-6 space-y-1.5 text-[0.98rem]">
              <a className="block hover:text-gold" href={`tel:${t("phone").replace(/[^\d+]/g, "")}`}>
                {t("phone")}
              </a>
              <a className="block break-all hover:text-gold" href={`mailto:${t("email")}`}>
                {t("email")}
              </a>
            </div>
            <p className="mt-6 whitespace-pre-line border-t border-taupe/20 pt-5 text-sm leading-relaxed text-taupe">
              {t("hours")}
            </p>
            <p className="mt-6 text-xs leading-relaxed text-taupe/80">{forms("consent")}</p>
          </Reveal>
        </div>
      </main>
    </>
  );
}
