import { useEffect, useRef, useState, useId } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  initLiquidCursor,
  BLUR,
  TRAIL_LIFETIME,
  BLOB_RADIUS,
  DROPLET_CHANCE,
  EASING,
  IMAGE_URL,
} from "@/lib/liquid-cursor";

export interface HeroBlueLaserBackgroundProps {
  /** Page/layout style variant */
  variant?: "hero" | "full" | "top" | "dim";
  /** Optional custom class name */
  className?: string;
  /** Whether mouse reactive displacement & liquid reveal are enabled (default: true) */
  interactive?: boolean;
  /** Whether continuous animation is enabled (default: true) */
  motion?: boolean;
  /** Path to the colorful reveal image (default: /assets/smoke.jpg) */
  imageUrl?: string;
  /** Vertical relative anchor for the spotlight center (0 to 1, default: 0.45) */
  hotspotY?: number;
  /** Spotlight & grid line intensity multiplier (default: 1.0) */
  beamIntensity?: number;
  /** Show play/pause motion control button (default: false) */
  showControls?: boolean;
}

export function HeroBlueLaserBackground({
  variant = "hero",
  className,
  interactive = true,
  motion = true,
  imageUrl = IMAGE_URL,
  hotspotY = 0.45,
  beamIntensity = 1.0,
  showControls = false,
}: HeroBlueLaserBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const liquidCanvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const componentId = useId();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. LIQUID CURSOR REVEAL EFFECT (Vanilla JS Liquid Engine)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isClient) return;
    const liquidCanvas = liquidCanvasRef.current;
    if (!liquidCanvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motion || prefersReducedMotion || paused) return;

    const cleanup = initLiquidCursor({
      canvas: liquidCanvas,
      imageUrl,
      blur: BLUR,
      trailLifetime: TRAIL_LIFETIME,
      blobRadius: BLOB_RADIUS,
      dropletChance: DROPLET_CHANCE,
      easing: EASING,
    });

    return () => {
      cleanup();
    };
  }, [isClient, motion, paused, imageUrl]);

  // ---------------------------------------------------------------------------
  // 2. DARK GRID BACKGROUND WITH "+" MARKERS (#08090c)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isClient) return;
    const canvas = gridCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d", { alpha: true });
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 240);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const renderGrid = () => {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // BASE BACKGROUND: Dark theme #08090c
      ctx.fillStyle = "#08090c";
      ctx.fillRect(0, 0, width, height);

      // Center subtle ambient spotlight behind the hero
      const centerX = width * 0.5;
      const spotY = height * hotspotY;

      const ambientSpot = ctx.createRadialGradient(
        centerX,
        spotY,
        40,
        centerX,
        spotY,
        Math.min(width, 1100) * 0.65,
      );
      ambientSpot.addColorStop(0, `rgba(255, 255, 255, ${0.04 * beamIntensity})`);
      ambientSpot.addColorStop(0.4, `rgba(255, 255, 255, ${0.015 * beamIntensity})`);
      ambientSpot.addColorStop(0.8, "rgba(255, 255, 255, 0.002)");
      ambientSpot.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientSpot;
      ctx.fillRect(0, 0, width, height);

      // FINE MATRIX GRID (80px blueprint squares)
      const cellSize = width < 768 ? 64 : 80;
      const offsetX = (width % cellSize) * 0.5;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.038 * beamIntensity})`;

      ctx.beginPath();
      for (let x = offsetX; x <= width; x += cellSize) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.restore();

      // STRUCTURAL ARCHITECTURAL GUIDE LINES
      const structuralCols = [
        centerX - 640, // Container Left
        centerX - 395, // Composer Left
        centerX, // Center
        centerX + 395, // Composer Right
        centerX + 640, // Container Right
      ];

      if (width > 1500) {
        structuralCols.unshift(centerX - 880);
        structuralCols.push(centerX + 880);
      }

      const structuralRows = [
        88, // Header bottom line
        190, // Above eyebrow
        340, // Above composer
        620, // Below composer
        840, // Section transition
      ];

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.075 * beamIntensity})`;

      ctx.beginPath();
      for (const colX of structuralCols) {
        if (colX >= 0 && colX <= width) {
          const snapX = Math.round(colX) + 0.5;
          ctx.moveTo(snapX, 0);
          ctx.lineTo(snapX, height);
        }
      }
      for (const rowY of structuralRows) {
        if (rowY <= height) {
          const snapY = Math.round(rowY) + 0.5;
          ctx.moveTo(0, snapY);
          ctx.lineTo(width, snapY);
        }
      }
      ctx.stroke();

      // "+" CROSSHAIR MARKERS AT KEY INTERSECTIONS
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.28 * beamIntensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();

      const crossSize = 4.5;
      for (const colX of structuralCols) {
        if (colX < 10 || colX > width - 10) continue;
        const snapX = Math.round(colX) + 0.5;

        for (const rowY of structuralRows) {
          if (rowY > height - 10) continue;
          const snapY = Math.round(rowY) + 0.5;

          ctx.moveTo(snapX - crossSize, snapY);
          ctx.lineTo(snapX + crossSize, snapY);
          ctx.moveTo(snapX, snapY - crossSize);
          ctx.lineTo(snapX, snapY + crossSize);
        }
      }
      ctx.stroke();
      ctx.restore();

      // BOTTOM GRADIENT FADE: Smoothly melt into lower page sections
      if (variant === "hero" || variant === "top") {
        const fadeY = height * 0.76;
        const fadeGrad = ctx.createLinearGradient(0, fadeY, 0, height);
        fadeGrad.addColorStop(0, "rgba(8, 9, 12, 0)");
        fadeGrad.addColorStop(0.65, "rgba(8, 9, 12, 0.75)");
        fadeGrad.addColorStop(1, "rgba(8, 9, 12, 1)");

        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, fadeY, width, height - fadeY);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      renderGrid();
    });
    resizeObserver.observe(container);

    resize();
    renderGrid();

    return () => {
      resizeObserver.disconnect();
    };
  }, [isClient, hotspotY, beamIntensity, variant]);

  // Variant-based container CSS classes
  const variantClasses = {
    hero: "absolute inset-0 h-[1120px] max-w-full overflow-hidden pointer-events-none z-0",
    full: "fixed inset-0 h-screen w-screen overflow-hidden pointer-events-none z-[-1]",
    top: "absolute top-0 inset-x-0 h-[620px] overflow-hidden pointer-events-none z-0",
    dim: "fixed inset-0 h-screen w-screen opacity-45 overflow-hidden pointer-events-none z-[-1]",
  }[variant];

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        data-testid="hero-blue-laser-background"
        className={cn("hero-laser-background relative", variantClasses, className)}
      >
        {/* Layer 1: Dark grid with '+' markers (#08090c) */}
        <canvas
          ref={gridCanvasRef}
          id={`grid-canvas-${componentId}`}
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />

        {/* Layer 2: Liquid cursor reveal canvas (smoke.jpg revealed through gooey metaballs) */}
        <canvas
          ref={liquidCanvasRef}
          id="liquid-bg"
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />
      </div>

      {showControls && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-50 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-neutral-900/80 text-white backdrop-blur transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-white"
          aria-label={paused ? "Play background animation" : "Pause background animation"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        </button>
      )}
    </>
  );
}

// Aliases for semantic clarity
export { HeroBlueLaserBackground as LiquidCursorBackground };
export { HeroBlueLaserBackground as AuraGridBackground };
