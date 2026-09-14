import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });
  return { title: t("fairHousing") };
}

export default async function FairHousingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <LegalPage
      title={t("fairHousing")}
      updated="August 29, 2026"
      intro={[
        "Sol & Stone is committed to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation, and to full compliance with the federal Fair Housing Act.",
      ]}
      sections={[
        {
          heading: "Federal law",
          paragraphs: [
            "Title VIII of the Civil Rights Act of 1968 (the Fair Housing Act), as amended, makes it illegal to refuse to sell, rent to, or negotiate with any person, or to otherwise make housing unavailable, because of:",
          ],
          list: ["Race or color", "Religion", "National origin", "Sex (including gender identity and sexual orientation)", "Familial status (including families with children under 18 and pregnant people)", "Disability"],
        },
        {
          heading: "California law",
          paragraphs: [
            "California's Fair Employment and Housing Act (FEHA) and Unruh Civil Rights Act extend these protections further. In California, it is also unlawful to discriminate in housing on the basis of:",
          ],
          list: [
            "Marital status",
            "Ancestry",
            "Source of income (including Section 8 and other housing vouchers)",
            "Genetic information",
            "Immigration or citizenship status",
            "Age",
            "Military or veteran status",
          ],
        },
        {
          heading: "Our commitment",
          list: [
            "Every Sol & Stone agent represents buyers, sellers, tenants, and landlords without regard to any protected characteristic listed above.",
            "We advertise and market every listing to the widest possible audience and do not use language, imagery, or placement that expresses a preference or limitation based on a protected class.",
            "We provide reasonable accommodations and modifications for people with disabilities in connection with viewing, renting, or purchasing property, as required by law.",
            "We train our team on fair housing obligations and expect the same commitment from every affiliated agent and vendor.",
          ],
        },
        {
          heading: "If you believe you have experienced discrimination",
          paragraphs: [
            "You may file a complaint with the U.S. Department of Housing and Urban Development (HUD), Office of Fair Housing and Equal Opportunity, at hud.gov/fairhousing or by calling 1-800-669-9777 (TTY: 1-800-877-8339), or with the California Civil Rights Department (CRD) at calcivilrights.ca.gov or 1-800-884-1684. You may also contact us directly and we will investigate promptly.",
          ],
        },
        {
          heading: "Contact us",
          paragraphs: [
            "Sol & Stone, 8721 Sunset Boulevard, Suite 400, West Hollywood, CA 90069 · fairhousing@solandstone.example · (310) 555-0100.",
          ],
        },
      ]}
    />
  );
}
