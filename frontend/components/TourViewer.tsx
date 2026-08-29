"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { mediaUrl } from "@/lib/format";
import { generatePanorama } from "@/lib/panorama";
import type { TourScene } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    pannellum?: any;
  }
}

let loader: Promise<void> | null = null;

/** Load the vendored Pannellum build once, lazily (spec §5.3). */
function loadPannellum(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.pannellum) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/vendor/pannellum/pannellum.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "/vendor/pannellum/pannellum.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("pannellum failed to load"));
    document.head.appendChild(script);
  });
  return loader;
}

export function TourViewer({
  scenes,
  onClose,
  title,
}: {
  scenes: TourScene[];
  onClose: () => void;
  title: string;
}) {
  const t = useTranslations("listing");
  const holder = useRef<HTMLDivElement>(null);
  const viewer = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [current, setCurrent] = useState(scenes[0]?.scene_id ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    loadPannellum()
      .then(() => {
        if (cancelled || !holder.current || !window.pannellum) return;

        const config: Record<string, any> = {};
        for (const scene of scenes) {
          config[scene.scene_id] = {
            type: "equirectangular",
            panorama: scene.url ? mediaUrl(scene.url) : generatePanorama(scene.scene_id, scene.room_name),
            yaw: scene.initial_yaw,
            pitch: scene.initial_pitch,
            hfov: 105,
            autoLoad: true,
            showControls: false,
            hotSpots: (scene.hotspots ?? []).map((h) => ({
              pitch: h.pitch,
              yaw: h.yaw,
              type: "scene",
              text: h.text,
              sceneId: h.target,
              cssClass: "ss-hotspot",
            })),
          };
        }

        viewer.current = window.pannellum.viewer(holder.current, {
          default: {
            firstScene: scenes[0]?.scene_id,
            sceneFadeDuration: 400,
            autoLoad: true,
            showFullscreenCtrl: false,
            showZoomCtrl: false,
            keyboardZoom: true,
          },
          scenes: config,
        });

        viewer.current.on("scenechange", (id: string) => setCurrent(id));
        viewer.current.on("load", () => !cancelled && setStatus("ready"));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      try {
        viewer.current?.destroy?.();
      } catch {
        /* the viewer may already be gone */
      }
      viewer.current = null;
    };
  }, [scenes]);

  const goto = useCallback((sceneId: string) => {
    viewer.current?.loadScene(sceneId);
    setCurrent(sceneId);
  }, []);

  // Portalled to <body>: the page wrapper animates, which would otherwise trap
  // this dialog in a stacking context beneath the sticky navbar.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex flex-col bg-soft-black text-warm-white"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <p className="eyebrow text-gold">{t("tourSubtitle")}</p>
          <h2 className="font-serif text-xl font-light sm:text-2xl">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border border-warm-white/30 px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:border-warm-white"
        >
          {t("tourClose")}
        </button>
      </div>

      <div className="relative flex-1">
        <div ref={holder} className="absolute inset-0" />
        {status === "loading" && (
          <p className="absolute inset-0 grid place-items-center text-sm text-warm-white/70">
            {t("tourLoading")}
          </p>
        )}
        {status === "error" && (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-warm-white/70">
            {t("tourUnavailable")}
          </p>
        )}
      </div>

      <div className="border-t border-warm-white/15 px-5 py-4 sm:px-8">
        <p className="eyebrow mb-3 text-warm-white/50">{t("tourRooms")}</p>
        <div className="flex flex-wrap gap-2">
          {scenes.map((s) => (
            <button
              key={s.scene_id}
              type="button"
              onClick={() => goto(s.scene_id)}
              aria-current={current === s.scene_id}
              className={`border px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                current === s.scene_id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-warm-white/25 hover:border-warm-white/60"
              }`}
            >
              {s.room_name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-warm-white/50">{t("tourHint")}</p>
      </div>
    </div>,
    document.body,
  );
}