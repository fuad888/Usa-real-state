import { Navbar } from "@/components/Navbar";

type Section = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

/**
 * Shared shell for the legal pages (spec §18). Body copy is authored in
 * English only — standard practice for US legal/compliance notices even on a
 * bilingual site — while the page chrome (title, nav, footer) stays localized.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string[];
  sections: Section[];
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="page-in mx-auto max-w-[860px] px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-2xl border-b border-taupe/20 pb-8">
          <h1 className="display text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-taupe">Last updated: {updated}</p>
        </header>

        {intro ? (
          <div className="mt-8 space-y-4 text-[0.98rem] leading-[1.75] text-soft-black/85">
            {intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-4 space-y-12">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="eyebrow text-gold">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-[0.98rem] leading-[1.75] text-soft-black/85">
                {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
                {section.list ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
