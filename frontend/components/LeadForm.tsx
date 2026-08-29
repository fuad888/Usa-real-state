"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";

import { submitLead, type LeadInput } from "@/lib/api";

export type LeadFormProps = {
  type: LeadInput["type"];
  propertySlug?: string;
  submitLabel?: string;
  messagePlaceholder?: string;
  showMessage?: boolean;
  showSchedule?: boolean;
  extra?: Record<string, unknown>;
  compact?: boolean;
  children?: ReactNode;
};

/**
 * Every public form on the site posts here (spec §5.3 / §5.4 / §12).
 *
 * Shared behaviour: a hidden honeypot field, TCPA consent (spec §18), inline
 * validation, and a success state that does not bounce the visitor elsewhere.
 * Leads land in the Django admin inbox; email/SMS notification is Phase 2.
 */
export function LeadForm({
  type,
  propertySlug,
  submitLabel,
  messagePlaceholder,
  showMessage = true,
  showSchedule = false,
  extra,
  compact = false,
  children,
}: LeadFormProps) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const uid = useId();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();

    if (!name) next.name = t("required");
    if (!email) next.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t("invalidEmail");
    if (!form.get("consent")) next.consent = t("consentRequired");

    setErrors(next);
    if (Object.keys(next).length) return;

    setState("sending");
    try {
      await submitLead({
        type,
        name,
        email,
        phone: String(form.get("phone") ?? ""),
        message: String(form.get("message") ?? ""),
        property_slug: propertySlug,
        preferred_date: String(form.get("preferred_date") ?? "") || undefined,
        preferred_time: String(form.get("preferred_time") ?? "") || undefined,
        consent_marketing: true,
        source_locale: locale,
        website: String(form.get("website") ?? ""),
        ...(extra ? { valuation_data: extra } : {}),
      });
      setState("sent");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t("error"));
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="border border-gold/40 bg-gold/5 px-6 py-8 text-center">
        <p className="font-serif text-2xl font-light">{t("sent")}</p>
        <p className="mt-2 text-sm leading-relaxed text-taupe">{t("sentBody")}</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-5 text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:underline"
        >
          {t("another")}
        </button>
      </div>
    );
  }

  const field =
    "w-full border border-taupe/30 bg-warm-white px-3.5 py-3 text-sm focus:border-gold focus:outline-none";
  const label = "eyebrow mb-1.5 block text-taupe";

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? "grid gap-4" : "grid gap-5"}>
      {children}

      {/* Honeypot — visually hidden, never announced, bots fill it (spec §12) */}
      <div className="hidden" aria-hidden>
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className={label} htmlFor={`${uid}-name`}>
            {t("name")}
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            className={field}
          />
          {errors.name && (
            <p id={`${uid}-name-err`} className="mt-1 text-xs text-[#8a4b3c]">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor={`${uid}-email`}>
            {t("email")}
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={field}
          />
          {errors.email && (
            <p id={`${uid}-email-err`} className="mt-1 text-xs text-[#8a4b3c]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className={showSchedule ? "grid gap-4 sm:grid-cols-3" : ""}>
        <div>
          <label className={label} htmlFor={`${uid}-phone`}>
            {t("phone")}
          </label>
          <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" className={field} />
        </div>
        {showSchedule && (
          <>
            <div>
              <label className={label} htmlFor={`${uid}-date`}>
                {t("date")}
              </label>
              <input id={`${uid}-date`} name="preferred_date" type="date" className={field} />
            </div>
            <div>
              <label className={label} htmlFor={`${uid}-time`}>
                {t("time")}
              </label>
              <select id={`${uid}-time`} name="preferred_time" className={field} defaultValue="">
                <option value="">—</option>
                <option value="morning">{t("timeMorning")}</option>
                <option value="afternoon">{t("timeAfternoon")}</option>
                <option value="evening">{t("timeEvening")}</option>
              </select>
            </div>
          </>
        )}
      </div>

      {showMessage && (
        <div>
          <label className={label} htmlFor={`${uid}-message`}>
            {t("message")}
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={compact ? 3 : 4}
            placeholder={messagePlaceholder}
            className={`${field} resize-y`}
          />
        </div>
      )}

      <div>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-taupe">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#b9975b]"
            aria-invalid={!!errors.consent}
          />
          <span>{t("consent")}</span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-[#8a4b3c]">{errors.consent}</p>}
      </div>

      {state === "error" && (
        <p role="alert" className="border border-[#8a4b3c]/40 bg-[#8a4b3c]/5 px-4 py-3 text-sm text-[#8a4b3c]">
          {message || t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="bg-soft-black px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-warm-white transition-colors duration-300 hover:bg-gold disabled:opacity-60"
      >
        {state === "sending" ? t("sending") : (submitLabel ?? t("submit"))}
      </button>
    </form>
  );
}
