"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

import { placeholderStyle } from "./MediaFrame";

/**
 * Editorial hero (spec §5.1). Accepts either a still or a video source so the
 * admin can flip `hero_type` without a code change; on small screens the video
 * is never fetched — the still stands in, for performance (spec §9.4).
 *
 * With no media configured (the demo default) it paints a dark brand gradient,
 * which keeps the overlaid type legible without a photograph.
 */
export function Hero({
  image,
  video,
  alt,
  seed,
  children,
  height = "tall",
  overlay = 0.42,
}: {
  image?: string | null;
  video?: string | null;
  alt: string;
  seed: string;
  children: ReactNode;
  height?: "tall" | "short";
  overlay?: number;
}) {
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    if (!video) return;
    const mq = matchMedia("(min-width: 768px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setUseVideo(mq.matches && !reduce.matches);
    update();
    mq.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, [video]);

  return (
    <section
      className={`relative -mt-[calc(var(--nav-h)+var(--ticker-h))] flex items-end overflow-hidden bg-soft-black ${
        height === "tall" ? "min-h-[88svh]" : "min-h-[62svh]"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          priority
          sizes="100vw"
          unoptimized={image.startsWith("http")}
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0" style={placeholderStyle(seed, true)} />
      )}

      {useVideo && video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          poster={image ?? undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(28,27,25,${overlay + 0.32}) 0%, rgba(28,27,25,${overlay * 0.45}) 48%, rgba(28,27,25,${overlay * 0.75}) 100%)`,
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-16 pt-[calc(var(--nav-h)+var(--ticker-h)+3rem)] text-warm-white sm:px-8 sm:pb-20">
        {children}
      </div>
    </section>
  );
}
