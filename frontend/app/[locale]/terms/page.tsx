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
  return { title: t("terms") };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <LegalPage
      title={t("terms")}
      updated="August 29, 2026"
      intro={[
        "These Terms of Use (“Terms”) govern your access to and use of solandstone.example (the “Site”), operated by Sol & Stone. By using the Site, you agree to these Terms. If you do not agree, do not use the Site.",
      ]}
      sections={[
        {
          heading: "Demonstration content",
          paragraphs: [
            "This Site is a demonstration build. Every listing, price, agent, community profile, market statistic, and testimonial shown is fictional and created for illustrative purposes only. Nothing on this Site is an offer to sell, lease, or otherwise transact in real property, and no information on it should be relied upon for any actual real estate decision.",
          ],
        },
        {
          heading: "No brokerage or professional advice",
          paragraphs: [
            "Content on the Site — including the AI valuation tool, market ticker, and neighborhood insights — is provided for general informational purposes only and does not constitute a broker price opinion, appraisal, legal advice, financial advice, or a substitute for representation by a licensed real estate professional. Always consult a licensed agent, attorney, or financial advisor before making a real estate decision.",
          ],
        },
        {
          heading: "Eligibility and acceptable use",
          paragraphs: ["When using the Site, you agree that you will not:"],
          list: [
            "Use the Site for any unlawful purpose or in violation of any applicable local, state, or federal law, including fair housing laws.",
            "Submit false, misleading, or fraudulent information through any form.",
            "Attempt to gain unauthorized access to the Site, its servers, or any connected system.",
            "Scrape, harvest, or use automated means to extract data from the Site without our prior written consent.",
            "Upload or transmit any virus, malware, or other harmful code.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The Site and its original content, design, graphics, and other materials (excluding fictional listing data) are owned by Sol & Stone or its licensors and are protected by U.S. and international copyright, trademark, and other intellectual property laws. You may view and print pages for personal, non-commercial use only. Any other use requires our prior written permission.",
          ],
        },
        {
          heading: "User submissions",
          paragraphs: [
            "Information you submit through a contact, lead, or valuation form is provided voluntarily. By submitting it, you confirm it is accurate to the best of your knowledge and you grant us permission to use it to respond to your inquiry as described in our Privacy Policy.",
          ],
        },
        {
          heading: "Third-party links and services",
          paragraphs: [
            "The Site may link to or embed third-party services (for example mapping or market-data providers). We do not control and are not responsible for the content, accuracy, or practices of third-party sites.",
          ],
        },
        {
          heading: "Disclaimer of warranties",
          paragraphs: [
            "THE SITE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY INFORMATION ON IT (INCLUDING PRICING, AVAILABILITY, OR VALUATION ESTIMATES) IS ACCURATE OR CURRENT.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "TO THE FULLEST EXTENT PERMITTED BY LAW, SOL & STONE AND ITS OWNERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING FROM YOUR USE OF THE SITE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SITE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100).",
          ],
        },
        {
          heading: "Indemnification",
          paragraphs: [
            "You agree to indemnify and hold harmless Sol & Stone and its owners, employees, and agents from any claim or demand, including reasonable attorneys' fees, arising out of your misuse of the Site or your violation of these Terms.",
          ],
        },
        {
          heading: "Governing law and dispute resolution",
          paragraphs: [
            "These Terms are governed by the laws of the State of California and applicable U.S. federal law, without regard to conflict-of-law principles. Any dispute arising from these Terms or the Site will be resolved exclusively in the state or federal courts located in Los Angeles County, California, and you consent to personal jurisdiction there, except that either party may bring an individual claim in small claims court.",
          ],
        },
        {
          heading: "Copyright complaints",
          paragraphs: [
            "If you believe material on the Site infringes your copyright, see our DMCA Notice for how to submit a takedown request.",
          ],
        },
        {
          heading: "Changes to these Terms",
          paragraphs: [
            "We may revise these Terms at any time by posting an updated version on this page. Continued use of the Site after changes take effect constitutes acceptance of the revised Terms.",
          ],
        },
        {
          heading: "Severability",
          paragraphs: [
            "If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force and effect.",
          ],
        },
        {
          heading: "Contact us",
          paragraphs: [
            "Sol & Stone, 8721 Sunset Boulevard, Suite 400, West Hollywood, CA 90069 · legal@solandstone.example · (310) 555-0100.",
          ],
        },
      ]}
    />
  );
}
