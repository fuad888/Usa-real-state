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
  return { title: t("accessibility") };
}

export default async function AccessibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <LegalPage
      title={t("accessibility")}
      updated="August 29, 2026"
      intro={[
        "Sol & Stone is committed to making solandstone.example usable by everyone, including people who use assistive technology such as screen readers, screen magnifiers, voice recognition software, or keyboard-only navigation.",
      ]}
      sections={[
        {
          heading: "Conformance target",
          paragraphs: [
            "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, published by the World Wide Web Consortium (W3C). These guidelines explain how to make web content more accessible to people with disabilities and are the benchmark most commonly used to assess conformance with Title III of the Americans with Disabilities Act (ADA) and California's Unruh Civil Rights Act as applied to websites.",
          ],
        },
        {
          heading: "What we do",
          list: [
            "Structure pages with semantic HTML and landmark regions so screen readers can navigate them predictably.",
            "Provide a “skip to content” link on every page and visible keyboard focus states throughout.",
            "Write descriptive alternative text for meaningful images and photo captions, and mark decorative graphics so they are ignored by assistive technology.",
            "Maintain sufficient color contrast between text and its background across the site's light and dark sections.",
            "Support browser and OS-level text resizing and zoom without loss of content or functionality.",
            "Label form fields, error messages, and interactive controls so they are announced correctly by assistive technology.",
            "Test key flows with keyboard-only navigation and automated accessibility tooling as part of our development process.",
          ],
        },
        {
          heading: "Known limitations",
          paragraphs: [
            "This is an active work in progress. Some third-party embedded content (such as map tiles or 360° virtual tours) may not fully meet every success criterion yet. All listing photography in this demonstration is a generated placeholder graphic with descriptive alt text standing in for real photography; production photography added in a later phase will retain equivalent alt text.",
          ],
        },
        {
          heading: "Reasonable accommodation for a property visit",
          paragraphs: [
            "If you need a reasonable accommodation to tour a property or attend an open house — for example a sign language interpreter or accessible parking information — contact the listing agent or our office in advance and we will do our best to assist, consistent with the Fair Housing Act's accommodation requirements. See our Fair Housing Notice for more.",
          ],
        },
        {
          heading: "Feedback and contact",
          paragraphs: [
            "If you encounter an accessibility barrier on this Site, please tell us the page, what happened, and the browser or assistive technology you were using, so we can investigate and fix it. We aim to respond within 5 business days.",
            "Email accessibility@solandstone.example, call (310) 555-0100, or write to Sol & Stone, 8721 Sunset Boulevard, Suite 400, West Hollywood, CA 90069.",
          ],
        },
      ]}
    />
  );
}
