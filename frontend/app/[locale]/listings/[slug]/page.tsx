import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/Gallery";
import { LeadForm } from "@/components/LeadForm";
import { MapView } from "@/components/MapView";
import { MediaFrame } from "@/components/MediaFrame";
import { Navbar } from "@/components/Navbar";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Reveal } from "@/components/Reveal";
import { SaveButton } from "@/components/SaveButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "@/i18n/navigation";
import { getProperties, getProperty } from "@/lib/api";
import { baths, dateLabel, money, num, paragraphs, priceLabel, propertyDescription } from "@/lib/format";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const properties = await getProperties();
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};
  const title = `${property.address}, ${property.city} — ${priceLabel(property)}`;
  return {
    title,
    description: propertyDescription(property, locale as Locale).slice(0, 180),
    alternates: { canonical: `/${locale}/listings/${slug}` },
    openGraph: { title, type: "article" },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;

  const property = await getProperty(slug);
  if (!property) notFound();

  const t = await getTranslations({ locale, namespace: "listing" });
  const forms = await getTranslations({ locale, namespace: "forms" });
  const typeLabels = await getTranslations({ locale, namespace: "propertyType" });

  const similar = (
    await getProperties({ listing_type: property.listing_type })
  )
    .filter((p) => p.slug !== property.slug)
    .slice(0, 3);

  const description = propertyDescription(property, lang);
  const scenes = property.tour_scenes ?? [];

  // Structured data for rich results (spec §8)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${property.address}, ${property.city}`,
    url: `/${locale}/listings/${property.slug}`,
    datePosted: property.created_at,
    description: description.slice(0, 400),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability:
        property.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zip_code,
      addressCountry: "US",
    },
    numberOfRooms: property.bedrooms,
    floorSize: { "@type": "QuantitativeValue", value: property.square_footage, unitCode: "FTK" },
  };

  const facts: { label: string; value: string }[] = [
    { label: t("beds"), value: String(property.bedrooms) },
    { label: t("baths"), value: baths(property.bathrooms) },
    { label: t("sqft"), value: `${num(property.square_footage)} sq ft` },
    ...(property.lot_size ? [{ label: t("lot"), value: `${num(property.lot_size)} sq ft` }] : []),
    ...(property.year_built ? [{ label: t("year"), value: String(property.year_built) }] : []),
    ...(property.price_per_sqft
      ? [{ label: t("pricePerSqft"), value: money(property.price_per_sqft) }]
      : []),
    { label: t("type"), value: typeLabels(property.property_type) },
    ...(property.hoa_fee ? [{ label: t("hoa"), value: `${money(property.hoa_fee)}/mo` }] : []),
  ];

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8">
        <Link
          href={property.listing_type === "rent" ? "/rent" : "/buy"}
          className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-gold"
        >
          ← {t("backToSearch")}
        </Link>

        <div className="mt-6">
          <Gallery property={property} images={property.images ?? []} scenes={scenes} />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <header className="border-b border-taupe/20 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={property.status} />
                {property.open_house_at ? (
                  <span className="text-[0.72rem] uppercase tracking-[0.14em] text-gold">
                    {t("openHouse", { date: dateLabel(property.open_house_at, lang) })}
                  </span>
                ) : null}
              </div>
              <h1 className="display mt-4 text-4xl sm:text-5xl">{property.address}</h1>
              <p className="mt-2 text-taupe">
                {property.neighborhood ? `${property.neighborhood} · ` : ""}
                {property.city}, {property.state} {property.zip_code}
              </p>
              <p className="display mt-6 text-3xl sm:text-4xl">
                {priceLabel(property)}
                {property.listing_type === "rent" ? (
                  <span className="ml-2 font-sans text-sm uppercase tracking-[0.16em] text-taupe">
                    {t("monthly")}
                  </span>
                ) : null}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="eyebrow text-taupe">{f.label}</dt>
                    <dd className="mt-1.5 font-serif text-xl font-light">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <SaveButton slug={property.slug} variant="full" />
              </div>
            </header>

            {description ? (
              <Reveal className="border-b border-taupe/20 py-10">
                <h2 className="eyebrow text-gold">{t("overview")}</h2>
                <div className="mt-5 max-w-2xl space-y-4 leading-relaxed text-soft-black/85">
                  {paragraphs(description).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {property.highlights?.length ? (
              <Reveal className="border-b border-taupe/20 py-10">
                <h2 className="eyebrow text-gold">{t("highlights")}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {property.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[0.95rem]">
                      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold" />
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {property.features?.length ? (
              <Reveal className="border-b border-taupe/20 py-10">
                <h2 className="eyebrow text-gold">{t("features")}</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {property.features.map((f) => (
                    <li
                      key={f}
                      className="border border-taupe/30 px-3.5 py-2 text-[0.8rem] text-taupe"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <Reveal className="py-10">
              <h2 className="eyebrow text-gold">{t("location")}</h2>
              <p className="mt-3 text-sm text-taupe">{t("locationBody")}</p>
              <MapView properties={[property]} className="mt-6 h-[380px] border border-taupe/20" />
              {property.community_slug ? (
                <Link
                  href={`/communities/${property.community_slug}`}
                  className="mt-5 inline-block border border-soft-black/25 px-5 py-3 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  {t("communityLink", { name: property.community_name ?? "" })}
                </Link>
              ) : null}
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            {property.agent ? (
              <div className="mb-6 flex items-center gap-4 border border-taupe/25 p-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                  <MediaFrame
                    src={property.agent.photo_url}
                    seed={`agent-${property.agent.slug}`}
                    alt={property.agent.name}
                    label={property.agent.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                    labelClassName="text-sm mt-1"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow text-taupe">{t("listedBy")}</p>
                  <Link
                    href={`/agents/${property.agent.slug}`}
                    className="block font-serif text-xl font-light hover:text-gold"
                  >
                    {property.agent.name}
                  </Link>
                  <p className="truncate text-xs text-taupe">{property.agent.phone}</p>
                </div>
              </div>
            ) : null}

            <div className="border border-taupe/25 p-6">
              <h2 className="font-serif text-2xl font-light">{t("scheduleTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-taupe">{t("scheduleBody")}</p>
              <div className="mt-6">
                <LeadForm
                  type="showing"
                  propertySlug={property.slug}
                  submitLabel={forms("scheduleSubmit")}
                  showSchedule
                  showMessage={false}
                  compact
                />
              </div>
            </div>

            <div className="mt-6 border border-taupe/25 p-6">
              <h2 className="font-serif text-2xl font-light">{t("askTitle")}</h2>
              <div className="mt-5">
                <LeadForm
                  type="question"
                  propertySlug={property.slug}
                  submitLabel={forms("askSubmit")}
                  messagePlaceholder={forms("questionPlaceholder")}
                  compact
                />
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20 border-t border-taupe/20 pt-14">
            <h2 className="display mb-10 text-3xl sm:text-4xl">{t("similar")}</h2>
            <PropertyGrid properties={similar} />
          </section>
        )}
      </main>
    </>
  );
}
