import { useTranslations } from "next-intl";

import type { Property } from "@/lib/types";

const TONE: Record<Property["status"], string> = {
  new: "bg-soft-black/85 text-warm-white",
  open_house: "bg-gold text-white",
  price_reduced: "bg-[#8a4b3c] text-white",
  pending: "bg-taupe text-white",
  coming_soon: "bg-warm-white/95 text-soft-black ring-1 ring-soft-black/15",
  sold: "bg-stone text-white",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: Property["status"];
  className?: string;
}) {
  const t = useTranslations("status");
  return (
    <span
      className={`eyebrow inline-flex items-center px-2.5 py-1 backdrop-blur-[2px] ${TONE[status]} ${className}`}
    >
      {t(status)}
    </span>
  );
}
