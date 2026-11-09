import { useEffect, useRef, useState, useId } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBlueLaserBackgroundProps {
  /** Page/layout style variant */
  variant?: "hero" | "full" | "top" | "dim";
  /** Optional custom class name */
  className?: string;
  /** Whether mouse reactive displacement & spotlight are enabled (default: true) */
  interactive?: boolean;
  /** Whether continuous animation is enabled (default: true) */
  motion?: boolean;
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
  hotspotY = 0.45,
  beamIntensity = 1.0,
  showControls = false,
}: HeroBlueLaserBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const componentId = useId();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d", { alpha: true });
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    let animationFrameId = 0;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Smoothed mouse state for gentle spotlight tracking
    const mouse = {
      targetX: -1000,
      targetY: -1000,
      currentX: -1000,
      currentY: -1000,
      active: false,
    };

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

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = motion && !prefersReducedMotion && !paused;

    let startTime = performance.now();

    const renderFrame = (now: number) => {
      if (!ctx || width === 0 || height === 0) return;

      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse lerping
      if (mouse.active) {
        if (mouse.currentX < -500) {
          mouse.currentX = mouse.targetX;
          mouse.currentY = mouse.targetY;
        } else {
          mouse.currentX += (mouse.targetX - mouse.currentX) * 0.08;
          mouse.currentY += (mouse.targetY - mouse.currentY) * 0.08;
        }
      } else {
        mouse.currentX += (-1000 - mouse.currentX) * 0.05;
        mouse.currentY += (-1000 - mouse.currentY) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // -------------------------------------------------------------
      // 1. BASE BACKGROUND: Deepest Onyx / Carbon Pure Black
      // -------------------------------------------------------------
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, width, height);

      // Center subtle ambient spotlight behind the hero title/composer
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
      ambientSpot.addColorStop(0, `rgba(255, 255, 255, ${0.045 * beamIntensity})`);
      ambientSpot.addColorStop(0.4, `rgba(255, 255, 255, ${0.018 * beamIntensity})`);
      ambientSpot.addColorStop(0.8, "rgba(255, 255, 255, 0.003)");
      ambientSpot.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientSpot;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // 2. FINE MATRIX GRID (Aura / v0 Square Blueprint Grid)
      // -------------------------------------------------------------
      const cellSize = width < 768 ? 64 : 80;
      const offsetX = (width % cellSize) * 0.5;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * beamIntensity})`;

      ctx.beginPath();
      // Vertical grid lines
      for (let x = offsetX; x <= width; x += cellSize) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      // Horizontal grid lines
      for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 3. STRUCTURAL ARCHITECTURAL GUIDE LINES & BOXES (Aura signature)
      // -------------------------------------------------------------
      // Structural column positions aligned with content framing
      const structuralCols = [
        centerX - 640, // 1280px Container Left
        centerX - 395, // 790px Composer Left
        centerX, // Exact Center Axis
        centerX + 395, // 790px Composer Right
        centerX + 640, // 1280px Container Right
      ];

      // Add outer columns on larger displays
      if (width > 1500) {
        structuralCols.unshift(centerX - 880);
        structuralCols.push(centerX + 880);
      }

      // Structural row positions (header line, hero bands, section break)
      const structuralRows = [
        88, // Header border bottom line
        190, // Above hero eyebrow badge
        340, // Above composer
        620, // Below composer card
        840, // Below hero section / suggestions
      ];

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * beamIntensity})`;

      // Draw primary structural vertical lines
      ctx.beginPath();
      for (const colX of structuralCols) {
        if (colX >= 0 && colX <= width) {
          const snapX = Math.round(colX) + 0.5;
          ctx.moveTo(snapX, 0);
          ctx.lineTo(snapX, height);
        }
      }

      // Draw primary structural horizontal lines
      for (const rowY of structuralRows) {
        if (rowY <= height) {
          const snapY = Math.round(rowY) + 0.5;
          ctx.moveTo(0, snapY);
          ctx.lineTo(width, snapY);
        }
      }
      ctx.stroke();

      // -------------------------------------------------------------
      // 4. ARCHITECTURAL INTERSECTION CROSSHAIR (+) MARKERS
      // -------------------------------------------------------------
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.32 * beamIntensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();

      const crossSize = 4.5;
      for (const colX of structuralCols) {
        if (colX < 10 || colX > width - 10) continue;
        const snapX = Math.round(colX) + 0.5;

        for (const rowY of structuralRows) {
          if (rowY > height - 10) continue;
          const snapY = Math.round(rowY) + 0.5;

          // Horizontal arm of cross
          ctx.moveTo(snapX - crossSize, snapY);
          ctx.lineTo(snapX + crossSize, snapY);

          // Vertical arm of cross
          ctx.moveTo(snapX, snapY - crossSize);
          ctx.lineTo(snapX, snapY + crossSize);
        }
      }
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 5. INTERACTIVE MOUSE SPOTLIGHT (Flashlight Effect)
      // -------------------------------------------------------------
      if (mouse.currentX > -500 && interactive) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const mSpot = ctx.createRadialGradient(
          mouse.currentX,
          mouse.currentY,
          20,
          mouse.currentX,
          mouse.currentY,
          420,
        );
        mSpot.addColorStop(0, `rgba(255, 255, 255, ${0.09 * beamIntensity})`);
        mSpot.addColorStop(0.35, `rgba(255, 255, 255, ${0.035 * beamIntensity})`);
        mSpot.addColorStop(0.7, `rgba(255, 255, 255, ${0.008 * beamIntensity})`);
        mSpot.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = mSpot;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, 420, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 6. BOTTOM GRADIENT SHADE: Seamlessly melt into page content
      // -------------------------------------------------------------
      if (variant === "hero" || variant === "top") {
        const fadeY = height * 0.76;
        const fadeGrad = ctx.createLinearGradient(0, fadeY, 0, height);
        fadeGrad.addColorStop(0, "rgba(5, 5, 7, 0)");
        fadeGrad.addColorStop(0.65, "rgba(5, 5, 7, 0.75)");
        fadeGrad.addColorStop(1, "rgba(5, 5, 7, 1)");

        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, fadeY, width, height - fadeY);
      }

      // Loop animation if motion is enabled
      if (shouldAnimate && isVisible) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    // Observers & Listeners
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!shouldAnimate) renderFrame(performance.now());
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isVisible = entry.isIntersecting;
        if (isVisible && shouldAnimate && !animationFrameId) {
          startTime = performance.now();
          animationFrameId = requestAnimationFrame(renderFrame);
        }
      }
    });
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      } else if (shouldAnimate && isVisible) {
        startTime = performance.now();
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial resize and render
    resize();
    renderFrame(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isClient, interactive, motion, paused, hotspotY, beamIntensity, variant]);

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
        className={cn("hero-laser-background", variantClasses, className)}
      >
        <canvas
          ref={canvasRef}
          id={`aura-grid-canvas-${componentId}`}
          className="block w-full h-full pointer-events-none"
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

// Alias for semantic clarity
export { HeroBlueLaserBackground as AuraGridBackground };
