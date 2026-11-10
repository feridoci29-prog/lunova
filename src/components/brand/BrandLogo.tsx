import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type LogoVariant = "gold" | "green" | "navy" | "multi";
export type LogoLetter = "L" | "E" | "N" | "O" | "V" | "A";
export type LogoSize = "sm" | "md" | "lg";

export interface BrandLogoProps {
  size?: LogoSize;
  interactive?: boolean;
  className?: string | undefined;
  floating?: boolean; // gentle floating balloon bobbing effect for hero
}

const LETTERS: LogoLetter[] = ["L", "E", "N", "O", "V", "A"];
const ALL_VARIANTS: LogoVariant[] = ["gold", "green", "navy", "multi"];

// Width to height aspect-ratio relative widths (all 202px height in multi)
const LETTER_WIDTH_PROPORTIONS: Record<LogoLetter, number> = {
  L: 142 / 202,
  E: 134 / 202,
  N: 135 / 202,
  O: 155 / 202,
  V: 162 / 202,
  A: 152 / 202,
};

// Preload all 24 letter images on client once
let isPreloaded = false;
function preloadAllLetterImages() {
  if (isPreloaded || typeof window === "undefined") return;
  isPreloaded = true;
  ALL_VARIANTS.forEach((v) => {
    LETTERS.forEach((l) => {
      const img = new Image();
      img.src = `/assets/logo/letters/${v}-${l}.png`;
    });
  });
}

export function BrandLogo({
  size = "md",
  interactive = true,
  className,
  floating = false,
}: BrandLogoProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const letterRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Current variant per letter index (0..5)
  const [variants, setVariants] = useState<LogoVariant[]>([
    "multi",
    "multi",
    "multi",
    "multi",
    "multi",
    "multi",
  ]);

  // Transform pop per letter: scale and rotate
  const [transforms, setTransforms] = useState<
    { scale: number; rotate: number; popping: boolean }[]
  >([
    { scale: 1, rotate: 0, popping: false },
    { scale: 1, rotate: 0, popping: false },
    { scale: 1, rotate: 0, popping: false },
    { scale: 1, rotate: 0, popping: false },
    { scale: 1, rotate: 0, popping: false },
    { scale: 1, rotate: 0, popping: false },
  ]);

  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const letterCooldownRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    preloadAllLetterImages();
  }, []);

  // Pick random variant, excluding navy in dark mode for contrast
  const pickRandomVariant = useCallback((current: LogoVariant): LogoVariant => {
    const isDark =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : false;

    const pool = isDark
      ? ALL_VARIANTS.filter((v) => v !== "navy")
      : ALL_VARIANTS;

    const choices = pool.filter((v) => v !== current);
    if (choices.length === 0) return "gold";
    return choices[Math.floor(Math.random() * choices.length)]!;
  }, []);

  // Shuffle a specific single letter with scale pop and random rotate
  const shuffleLetter = useCallback(
    (index: number) => {
      const now = performance.now();
      if (now - letterCooldownRef.current[index]! < 400) return;
      letterCooldownRef.current[index] = now;

      setVariants((prev) => {
        const next = [...prev];
        next[index] = pickRandomVariant(prev[index]!);
        return next;
      });

      const rot = (Math.random() * 8 - 4); // -4 to 4 deg
      setTransforms((prev) => {
        const next = [...prev];
        next[index] = { scale: 1.14, rotate: rot, popping: true };
        return next;
      });

      window.setTimeout(() => {
        setTransforms((prev) => {
          const next = [...prev];
          if (next[index]) {
            next[index] = { scale: 1, rotate: 0, popping: false };
          }
          return next;
        });
      }, 300);
    },
    [pickRandomVariant],
  );

  // Staggered shuffle of all 6 letters (60ms apart)
  const triggerFullShuffle = useCallback(() => {
    if (!interactive) return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    LETTERS.forEach((_, i) => {
      window.setTimeout(() => {
        shuffleLetter(i);
      }, i * 60);
    });
  }, [interactive, shuffleLetter]);

  // When pointer leaves or after inactivity, settle back to multi variant after 600ms
  const handlePointerLeave = useCallback(() => {
    if (!interactive) return;

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setVariants(["multi", "multi", "multi", "multi", "multi", "multi"]);
      setTransforms([
        { scale: 1, rotate: 0, popping: false },
        { scale: 1, rotate: 0, popping: false },
        { scale: 1, rotate: 0, popping: false },
        { scale: 1, rotate: 0, popping: false },
        { scale: 1, rotate: 0, popping: false },
        { scale: 1, rotate: 0, popping: false },
      ]);
    }, 600);
  }, [interactive]);

  // TASK 2: Liquid blob overlap listener (rAF-throttled pointer distance check <= 60px)
  useEffect(() => {
    if (!interactive || typeof window === "undefined") return;

    let rafId = 0;
    let pendingX = -10000;
    let pendingY = -10000;
    let hasMove = false;

    const checkProximity = () => {
      if (!hasMove) return;
      hasMove = false;

      // Check distance to each letter bounding box
      letterRefs.current.forEach((imgElem, i) => {
        if (!imgElem) return;
        const rect = imgElem.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const dist = Math.hypot(pendingX - centerX, pendingY - centerY);

        // If pointer / liquid blob is within ~60px of the letter
        if (dist <= 62) {
          shuffleLetter(i);
        }
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!hasMove) {
        hasMove = true;
        rafId = requestAnimationFrame(checkProximity);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [interactive, shuffleLetter]);

  // Sizing definitions:
  // sm: 28px height, md: 36px height, lg: 56px height
  const heightPx = size === "sm" ? 28 : size === "md" ? 36 : 56;
  const negativeMargin = size === "sm" ? "-3px" : size === "md" ? "-5px" : "-8px";

  return (
    <Link
      to="/"
      ref={containerRef}
      role="img"
      aria-label="Lenova"
      onPointerEnter={triggerFullShuffle}
      onPointerLeave={handlePointerLeave}
      onFocus={triggerFullShuffle}
      className={cn(
        "lenova-brand-logo group relative inline-flex items-center select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl transition-all duration-300",
        className,
      )}
      style={{
        height: `${heightPx}px`,
      }}
    >
      <div
        className="flex items-center"
        style={{
          filter: "var(--logo-drop-shadow)",
        }}
      >
        {LETTERS.map((char, index) => {
          const currentVariant = variants[index]!;
          const transform = transforms[index]!;
          const widthPx = Math.round(heightPx * LETTER_WIDTH_PROPORTIONS[char]);

          // Optional balloon floating animation delays per letter
          const floatDelay = `${index * 0.4}s`;

          return (
            <img
              key={char}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              src={`/assets/logo/letters/${currentVariant}-${char}.png`}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="eager"
              width={widthPx}
              height={heightPx}
              className={cn(
                "lenova-balloon-letter block transition-transform duration-300 ease-out will-change-transform",
                floating && "animate-balloon-float",
              )}
              style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                marginLeft: index === 0 ? "0" : negativeMargin,
                transform: `scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                animationDelay: floatDelay,
              }}
            />
          );
        })}
      </div>
    </Link>
  );
}

