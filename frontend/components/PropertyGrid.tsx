import type { Property } from "@/lib/types";

import { PropertyCard } from "./PropertyCard";
import { Reveal } from "./Reveal";

export function PropertyGrid({
  properties,
  columns = 3,
  compact = false,
}: {
  properties: Property[];
  columns?: 2 | 3 | 4;
  compact?: boolean;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={`grid grid-cols-1 gap-x-6 gap-y-12 ${cols}`}>
      {properties.map((p, i) => (
        <Reveal as="li" key={p.slug} delay={Math.min(i, 5) * 60}>
          <PropertyCard property={p} priority={i < 3} compact={compact} />
        </Reveal>
      ))}
    </ul>
  );
}
