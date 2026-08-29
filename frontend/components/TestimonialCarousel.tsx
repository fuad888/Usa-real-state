"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const KEYS = ["t1", "t2", "t3"] as const;

export function TestimonialCarousel() {
  const t = useTranslations("testimonials");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % KEYS.length), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="min-h-[13rem] sm:min-h-[11rem]">
        {KEYS.map((k, i) => (
          <blockquote
            key={k}
            aria-hidden={i !== index}
            className={`transition-opacity duration-500 ${
              i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <p className="display text-2xl leading-snug sm:text-[1.85rem]">“{t(k)}”</p>
            <footer className="mt-6 text-sm text-taupe">
              <span className="text-soft-black">{t(`${k}Author`)}</span>
              <span aria-hidden className="mx-2 opacity-40">
                ·
              </span>
              {t(`${k}Meta`)}
            </footer>
          </blockquote>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {KEYS.map((k, i) => (
          <button
            key={k}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1} / ${KEYS.length}`}
            aria-current={i === index}
            className={`h-px w-10 transition-colors duration-300 ${
              i === index ? "bg-gold" : "bg-taupe/40 hover:bg-taupe"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
