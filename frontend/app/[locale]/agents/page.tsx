import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentCard } from "@/components/AgentCard";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { getAgents } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agents" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function AgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "agents" });
  const agents = await getAgents();

  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-2xl">
          <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
          <p className="mt-4 text-taupe">{t("subtitle")}</p>
        </header>
        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 70}>
              <AgentCard agent={a} />
            </Reveal>
          ))}
        </ul>
      </main>
    </>
  );
}
