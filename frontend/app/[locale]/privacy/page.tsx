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
  return { title: t("privacy") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <LegalPage
      title={t("privacy")}
      updated="August 29, 2026"
      intro={[
        "This Privacy Policy explains how Sol & Stone (“Sol & Stone,” “we,” “us”) collects, uses, and shares personal information when you visit solandstone.example or contact us about a property, and the choices and rights available to you under United States and California law.",
        "Demo notice: this site is a non-production showcase build. No real inquiries are collected, sold, or shared with third parties — lead-form submissions are stored only in the demo database for evaluation purposes. This policy is drafted as though the site were live, so it can be adopted as-is at launch.",
      ]}
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "We collect information you provide directly, such as your name, email address, phone number, and any message you submit through a contact, valuation, or listing-inquiry form.",
            "We also collect limited technical information automatically, including IP address, browser type, device type, pages viewed, and referring URLs, typically through server logs and analytics cookies.",
          ],
        },
        {
          heading: "How we use your information",
          list: [
            "To respond to inquiries about listings, schedule showings, and connect you with an agent.",
            "To send you requested market updates, newsletters, or valuation results (you may opt out at any time).",
            "To operate, secure, and improve the site, and to understand how it is used.",
            "To comply with legal obligations and enforce our Terms of Use.",
          ],
        },
        {
          heading: "How we share information",
          paragraphs: [
            "We do not sell personal information. We share information only with:",
          ],
          list: [
            "Sol & Stone agents and staff who need it to respond to your inquiry.",
            "Service providers who host our site, send email, or provide analytics, under contracts limiting their use of your data to providing that service.",
            "Government authorities or other parties when required by law, subpoena, or to protect the rights, property, or safety of Sol & Stone or others.",
          ],
        },
        {
          heading: "Cookies and analytics",
          paragraphs: [
            "We use cookies and similar technologies to remember your language preference, keep the site secure, and understand aggregate traffic patterns. You can control cookies through your browser settings; disabling them may limit some site features. We do not currently respond to browser “Do Not Track” signals because no common industry standard for honoring them has been adopted.",
          ],
        },
        {
          heading: "Your California privacy rights (CCPA/CPRA)",
          paragraphs: [
            "If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act, gives you the right to:",
          ],
          list: [
            "Know what personal information we have collected about you and why.",
            "Request deletion of personal information we hold about you, subject to certain exceptions.",
            "Correct inaccurate personal information.",
            "Opt out of the sale or sharing of personal information (we do not sell or share personal information for cross-context behavioral advertising).",
            "Not be discriminated against for exercising any of these rights.",
          ],
        },
        {
          heading: "Exercising your rights",
          paragraphs: [
            "You may submit a request by emailing privacy@solandstone.example or calling (310) 555-0100. We will verify your identity before fulfilling a request and will respond within the time required by applicable law (generally 45 days, extendable once by an additional 45 days). You may also designate an authorized agent to submit a request on your behalf.",
          ],
        },
        {
          heading: "Other state privacy laws",
          paragraphs: [
            "Residents of other states with comprehensive privacy laws (for example Virginia, Colorado, Connecticut, and Utah) have similar rights to access, correct, delete, and obtain a copy of their personal information, and to opt out of targeted advertising. Contact us using the details above to exercise these rights.",
          ],
        },
        {
          heading: "Children's privacy",
          paragraphs: [
            "This site is intended for adults seeking real estate services and is not directed to children under 13. We do not knowingly collect personal information from children under 13, consistent with the Children's Online Privacy Protection Act (COPPA). If you believe a child has provided us information, contact us and we will delete it.",
          ],
        },
        {
          heading: "Marketing communications",
          paragraphs: [
            "Any email newsletters we send comply with the CAN-SPAM Act, including a clear sender identity and a working unsubscribe link in every message. If you provide a phone number and consent to SMS or calls, we will honor that consent as required by the Telephone Consumer Protection Act (TCPA) and stop contacting you if you withdraw consent.",
          ],
        },
        {
          heading: "Data retention and security",
          paragraphs: [
            "We retain personal information only as long as necessary for the purposes described in this policy, or as required by law or professional licensing recordkeeping obligations. We use reasonable administrative, technical, and physical safeguards to protect your information, but no method of transmission or storage is completely secure.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time. The “Last updated” date above reflects the most recent revision. Material changes will be posted on this page.",
          ],
        },
        {
          heading: "Contact us",
          paragraphs: [
            "Sol & Stone, 8721 Sunset Boulevard, Suite 400, West Hollywood, CA 90069 · privacy@solandstone.example · (310) 555-0100.",
          ],
        },
      ]}
    />
  );
}
