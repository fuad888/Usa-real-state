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
  return { title: t("dmca") };
}

export default async function DmcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <LegalPage
      title={t("dmca")}
      updated="August 29, 2026"
      intro={[
        "Sol & Stone respects the intellectual property rights of others and expects users of this Site to do the same. We respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act of 1998 (DMCA), 17 U.S.C. § 512.",
      ]}
      sections={[
        {
          heading: "Filing a takedown notice",
          paragraphs: [
            "If you believe content on this Site infringes a copyright you own, send a written notice to our designated agent below that includes all of the following, as required by 17 U.S.C. § 512(c)(3):",
          ],
          list: [
            "A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.",
            "Identification of the copyrighted work claimed to have been infringed.",
            "Identification of the material claimed to be infringing and information reasonably sufficient to let us locate it (for example, the specific page URL).",
            "Your name, address, telephone number, and email address.",
            "A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law.",
            "A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.",
          ],
        },
        {
          heading: "Designated DMCA agent",
          paragraphs: [
            "Sol & Stone DMCA Agent, 8721 Sunset Boulevard, Suite 400, West Hollywood, CA 90069 · dmca@solandstone.example · (310) 555-0100.",
            "In a production deployment, this agent's contact details would also be registered with the U.S. Copyright Office's DMCA Designated Agent Directory.",
          ],
        },
        {
          heading: "Counter-notification",
          paragraphs: [
            "If material you posted was removed and you believe this was a mistake or misidentification, you may submit a counter-notice to our designated agent that includes, per 17 U.S.C. § 512(g)(3):",
          ],
          list: [
            "Your physical or electronic signature.",
            "Identification of the material removed and its location before removal.",
            "A statement, under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification.",
            "Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal court in your district (or Los Angeles County, California, if outside the U.S.) and will accept service of process from the person who filed the original notice.",
          ],
        },
        {
          heading: "Repeat infringers",
          paragraphs: [
            "In appropriate circumstances, we will disable access to material and terminate access for users who are found to be repeat infringers, consistent with 17 U.S.C. § 512(i).",
          ],
        },
        {
          heading: "False claims",
          paragraphs: [
            "Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing, or that it was removed by mistake, may be liable for damages.",
          ],
        },
      ]}
    />
  );
}
