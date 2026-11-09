import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Progressive 3D backdrop. The legacy name keeps existing routes compatible. */
export function MoonBackground({
  variant = "full",
  className,
  motion = false,
}: {
  variant?: "full" | "dim" | "top";
  className?: string;
  motion?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const animation = useRef<{ pause: (paused: boolean) => void; dispose: () => void } | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!motion) return;
    let active = true;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 700px)");
    let generation = 0;
    const update = async () => {
      const attempt = ++generation;
      animation.current?.dispose();
      animation.current = null;
      setReady(false);
      if (preference.matches || narrow.matches || !host.current) return;
      try {
        const { createRibbonScene } = await import("@/lib/ribbon-scene");
        if (!active || attempt !== generation || !host.current) return;
        animation.current = createRibbonScene(host.current);
        setReady(true);
      } catch {
        /* SVG fallback stays visible when WebGL is unavailable. */
      }
    };
    void update();
    preference.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => {
      active = false;
      generation++;
      preference.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
      animation.current?.dispose();
      animation.current = null;
    };
  }, [motion]);
  useEffect(() => {
    animation.current?.pause(paused);
  }, [paused, ready]);
  return (
    <>
      <div
        aria-hidden="true"
        className={cn("draft-atmosphere", `draft-atmosphere--${variant}`, className)}
      >
        <div className="draft-atmosphere-glow" />
        <svg
          className={cn("draft-ribbon-fallback", ready && "draft-ribbon-fallback--quiet")}
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMin slice"
          role="presentation"
        >
          <defs>
            <linearGradient id="ribbon-surface" x1="0" y1="1" x2="1" y2="0">
              <stop stopColor="#335176" stopOpacity=".02" />
              <stop offset=".38" stopColor="#8da6ec" stopOpacity=".28" />
              <stop offset=".7" stopColor="#68c7f0" stopOpacity=".15" />
              <stop offset="1" stopColor="#c8a6ff" stopOpacity=".4" />
            </linearGradient>
            <linearGradient id="ribbon-edge">
              <stop stopColor="#8cb4ff" stopOpacity="0" />
              <stop offset=".35" stopColor="#9acafa" stopOpacity=".65" />
              <stop offset=".8" stopColor="#a2baff" stopOpacity=".85" />
              <stop offset="1" stopColor="#e4c2f9" stopOpacity=".65" />
            </linearGradient>
            <filter id="ribbon-soft">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>
          <path
            d="M-240 610C-40 12 190 300 415 442S1100 480 1407 150 1835 172 1520 403C1170 660 540 86 108 494S-142 800-240 610Z"
            fill="url(#ribbon-surface)"
          />
          <path
            d="M-240 610C-40 12 190 300 415 442S1100 480 1407 150 1835 172 1520 403"
            fill="none"
            stroke="url(#ribbon-edge)"
            strokeWidth="2"
          />
          <path
            d="M-120 490C140 148 300 380 480 458M1060 354C1400 205 1640 90 1582 270"
            fill="none"
            stroke="#6983d4"
            strokeOpacity=".22"
            strokeWidth="50"
            filter="url(#ribbon-soft)"
          />
        </svg>
        <div ref={host} className="draft-ribbon-scene" data-testid="ribbon-scene" />
        <div className="draft-atmosphere-shade" />
      </div>
      {ready && (
        <button
          type="button"
          className="draft-motion-control"
          aria-label={paused ? "Play background animation" : "Pause background animation"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        </button>
      )}
    </>
  );
}
