import { Link } from "@/i18n/navigation";
import type { Agent } from "@/lib/types";

import { MediaFrame } from "./MediaFrame";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group zoom-parent block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-warm-white-alt">
        <MediaFrame
          src={agent.photo_url}
          seed={`agent-${agent.slug}`}
          alt={agent.name}
          label={agent.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
          labelClassName="text-3xl"
          sizes="(max-width:640px) 50vw, 25vw"
          className="zoom-target"
        />
      </div>
      <h3 className="mt-4 font-serif text-2xl font-light">{agent.name}</h3>
      <p className="text-sm text-taupe">{agent.title}</p>
      {agent.neighborhoods?.length ? (
        <p className="mt-2 text-[0.78rem] text-taupe/85">{agent.neighborhoods.join(" · ")}</p>
      ) : null}
    </Link>
  );
}
