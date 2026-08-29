"use client";

import { useEffect, useRef, useState } from "react";

/** Count-up for stat blocks (spec §9.3). Never longer than 500ms… per digit sweep. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 900,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const reduce =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!node || reduce || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      setDone(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return;
      io.disconnect();
      setDone(true);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    });
    io.observe(node);
    return () => io.disconnect();
  }, [value, duration, done]);

  const rounded = value % 1 === 0 ? Math.round(display) : Math.round(display * 10) / 10;
  return (
    <span ref={ref} className={className}>
      {prefix}
      {new Intl.NumberFormat("en-US").format(rounded)}
      {suffix}
    </span>
  );
}
