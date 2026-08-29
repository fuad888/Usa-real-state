"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { requestValuation, type ValuationInput } from "@/lib/api";
import { money } from "@/lib/format";
import type { ValuationResult } from "@/lib/types";

import { LeadForm } from "./LeadForm";

/**
 * The Sell page's conversational estimate (spec §5.4).
 *
 * The order matters: the visitor gets a number first, and only then is the
 * "talk to an agent" form offered. The estimate itself comes from FastAPI
 * (/ai/valuation) — a transparent formula, clearly labelled as not an appraisal.
 */

type Step = {
  id: "address" | "sqft" | "lot" | "zone" | "condition" | "type";
  question: string;
  kind: "text" | "number" | "choice";
  placeholder?: string;
  skippable?: boolean;
  choices?: { value: string; label: string }[];
};

type Message = { from: "bot" | "user"; text: string };

const ZONES = [
  { value: "beverly-hills", label: "Beverly Hills" },
  { value: "bel-air", label: "Bel Air / Holmby Hills" },
  { value: "malibu", label: "Malibu" },
  { value: "santa-monica", label: "Santa Monica" },
  { value: "pacific-palisades", label: "Pacific Palisades" },
  { value: "brentwood", label: "Brentwood" },
  { value: "calabasas", label: "Calabasas / Hidden Hills" },
  { value: "studio-city", label: "Studio City / Sherman Oaks" },
  { value: "west-hollywood", label: "West Hollywood" },
  { value: "other-la", label: "Other Los Angeles County" },
];

export function ValuationChatWidget() {
  const t = useTranslations("sell");
  const types = useTranslations("propertyType");
  const locale = useLocale();

  const steps: Step[] = [
    { id: "address", question: t("q0"), kind: "text", placeholder: t("addressPlaceholder") },
    { id: "sqft", question: t("q1"), kind: "number", placeholder: t("sqftPlaceholder") },
    { id: "lot", question: t("q2"), kind: "number", placeholder: t("lotPlaceholder"), skippable: true },
    { id: "zone", question: t("q3"), kind: "choice", choices: ZONES },
    {
      id: "condition",
      question: t("q4"),
      kind: "choice",
      choices: [
        { value: "original", label: "Original" },
        { value: "updated", label: "Updated" },
        { value: "renovated", label: "Fully renovated" },
        { value: "luxury", label: "Luxury renovation" },
      ],
    },
    {
      id: "type",
      question: t("q5"),
      kind: "choice",
      choices: (["single_family", "condo", "townhome", "estate"] as const).map((v) => ({
        value: v,
        label: types(v),
      })),
    },
  ];

  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: steps[0].question }]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, result, busy]);

  const finish = async (collected: Record<string, string>) => {
    setBusy(true);
    setError("");
    setMessages((m) => [...m, { from: "bot", text: t("computing") }]);
    const payload: ValuationInput = {
      sqft: Number(collected.sqft) || 0,
      zone: collected.zone,
      condition: collected.condition,
      lot_size: collected.lot ? Number(collected.lot) : null,
      property_type: collected.type || "single_family",
      address: collected.address,
    };
    try {
      const data = await requestValuation(payload);
      setResult(data);
      setMessages((m) => [...m, { from: "bot", text: t("resultLead") }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  };

  const answer = (raw: string, display?: string) => {
    const current = steps[step];
    const next = { ...answers, [current.id]: raw };
    setAnswers(next);
    setMessages((m) => [...m, { from: "user", text: display ?? raw }]);
    setDraft("");

    if (step + 1 < steps.length) {
      setStep(step + 1);
      setMessages((m) => [...m, { from: "bot", text: steps[step + 1].question }]);
    } else {
      void finish(next);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setMessages([{ from: "bot", text: steps[0].question }]);
    setResult(null);
    setShowForm(false);
    setError("");
    setDraft("");
  };

  const current = steps[step];
  const done = result !== null;

  return (
    <div className="border border-taupe/25 bg-warm-white">
      <header className="flex items-center justify-between gap-4 border-b border-taupe/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 11 12 4l8 7" strokeLinejoin="round" />
              <path d="M6.5 10v9h11v-9" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-serif text-lg font-light leading-none">{t("assistantTitle")}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-taupe">
              {t("assistantStatus")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={restart}
          className="text-[0.68rem] uppercase tracking-[0.14em] text-taupe transition-colors hover:text-gold"
        >
          {t("restart")}
        </button>
      </header>

      <div
        ref={scroller}
        className="max-h-[26rem] space-y-3 overflow-y-auto px-5 py-6"
        role="log"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] px-4 py-3 text-[0.92rem] leading-relaxed ${
              m.from === "bot"
                ? "bg-warm-white-alt text-soft-black"
                : "ml-auto bg-soft-black text-warm-white"
            }`}
          >
            {m.text}
          </p>
        ))}

        {result && (
          <div className="border border-gold/45 bg-gold/5 px-5 py-6">
            <p className="eyebrow text-gold">{t("resultRange")}</p>
            <p className="display mt-2 text-3xl sm:text-4xl">
              {money(result.estimated_min)} – {money(result.estimated_max)}
            </p>
            {result.price_per_sqft ? (
              <p className="mt-2 text-sm text-taupe">
                {t("resultPerSqft", { value: money(result.price_per_sqft) })}
              </p>
            ) : null}

            <details className="mt-5 border-t border-gold/25 pt-4">
              <summary className="cursor-pointer text-[0.72rem] uppercase tracking-[0.14em] text-taupe hover:text-gold">
                {t("howTitle")}
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {result.breakdown.map((row, i) => (
                  <li key={i} className="flex justify-between gap-4 text-taupe">
                    <span>{row.label}</span>
                    <span className="shrink-0 text-soft-black">
                      {typeof row.value === "number" ? money(row.value) : row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            <p className="mt-5 border-t border-gold/25 pt-4 text-xs leading-relaxed text-taupe">
              {result.disclaimer}
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="border border-[#8a4b3c]/40 bg-[#8a4b3c]/5 px-4 py-3 text-sm text-[#8a4b3c]">
            {error}
          </p>
        )}
      </div>

      {!done && !busy && (
        <div className="border-t border-taupe/20 px-5 py-4">
          {current.kind === "choice" ? (
            <div className="flex flex-wrap gap-2">
              {current.choices!.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => answer(c.value, c.label)}
                  className="border border-taupe/35 px-3.5 py-2 text-[0.8rem] transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = draft.trim();
                if (!value) return;
                answer(current.kind === "number" ? value.replace(/\D/g, "") : value);
              }}
              className="flex gap-2"
            >
              <label className="sr-only" htmlFor="valuation-input">
                {current.question}
              </label>
              <input
                id="valuation-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                inputMode={current.kind === "number" ? "numeric" : "text"}
                placeholder={current.placeholder}
                className="min-w-0 flex-1 border border-taupe/30 px-3.5 py-3 text-sm focus:border-gold focus:outline-none"
              />
              {current.skippable && (
                <button
                  type="button"
                  onClick={() => answer("", t("skip"))}
                  className="px-3 text-[0.7rem] uppercase tracking-[0.14em] text-taupe hover:text-gold"
                >
                  {t("skip")}
                </button>
              )}
              <button
                type="submit"
                className="bg-soft-black px-5 text-[0.7rem] uppercase tracking-[0.16em] text-warm-white transition-colors duration-300 hover:bg-gold"
              >
                {t("send")}
              </button>
            </form>
          )}
          <p className="mt-3 text-[0.68rem] uppercase tracking-[0.12em] text-taupe/70">
            {step + 1} / {steps.length}
          </p>
        </div>
      )}

      {busy && (
        <p className="border-t border-taupe/20 px-5 py-4 text-sm text-taupe">{t("typing")}</p>
      )}

      {done && (
        <div className="border-t border-taupe/20 px-5 py-6">
          {showForm ? (
            <LeadForm
              type="valuation"
              compact
              submitLabel={t("ctaButton")}
              extra={{
                address: answers.address,
                sqft: Number(answers.sqft) || null,
                lot_size: answers.lot ? Number(answers.lot) : null,
                zone: answers.zone,
                condition: answers.condition,
                property_type: answers.type,
                estimated_min: result?.estimated_min,
                estimated_max: result?.estimated_max,
                locale,
              }}
            >
              <div>
                <h3 className="font-serif text-2xl font-light">{t("ctaTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-taupe">{t("ctaBody")}</p>
              </div>
            </LeadForm>
          ) : (
            <div className="text-center">
              <h3 className="font-serif text-2xl font-light">{t("ctaTitle")}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe">
                {t("ctaBody")}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 bg-soft-black px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-warm-white transition-colors duration-300 hover:bg-gold"
              >
                {t("ctaButton")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
