/**
 * Wordmark and monogram (spec §1.2): thin serif capitals, wide tracking, and a
 * single-stroke sun-over-horizon arc in muted gold.
 */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 26" className={className} role={title ? "img" : "presentation"}
         aria-hidden={title ? undefined : true} aria-label={title} fill="none">
      {title ? <title>{title}</title> : null}
      <path d="M6 20h28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M9.5 20a10.5 10.5 0 0 1 21 0" stroke="currentColor" strokeWidth="1" />
      <path d="M20 3.5v3M28.5 6.6l-1.8 2.2M11.5 6.6l1.8 2.2M3.5 14h2.6M33.9 14h2.6"
            stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

export function Logo({ className = "", markClassName = "" }: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`h-[1.15em] w-auto text-gold ${markClassName}`} />
      <span className="font-serif text-[1em] font-light uppercase tracking-[0.28em] leading-none">
        Sol <span className="text-gold">&</span> Stone
      </span>
    </span>
  );
}

export function Monogram({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif text-[1em] font-light uppercase tracking-[0.2em] ${className}`}>
      S<span className="text-gold">&</span>S
    </span>
  );
}
