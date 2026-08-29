import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { routing } from "@/i18n/routing";

import "../globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: `${t("name")} — ${t("tagline")}`, template: `%s · ${t("name")}` },
    description: t("shortDescription"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", es: "/es" },
    },
    openGraph: {
      type: "website",
      siteName: t("name"),
      title: `${t("name")} — ${t("tagline")}`,
      description: t("shortDescription"),
      images: ["/demo/home/hero.jpg"],
    },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-soft-black focus:px-4 focus:py-2 focus:text-warm-white"
          >
            {t("skipToContent")}
          </a>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
