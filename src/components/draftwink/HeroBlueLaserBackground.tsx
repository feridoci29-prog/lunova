import { useEffect, useRef, useState, useId } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBlueLaserBackgroundProps {
  /** Page/layout style variant */
  variant?: "hero" | "full" | "top" | "dim";
  /** Optional custom class name */
  className?: string;
  /** Whether mouse reactive displacement & ripple are enabled (default: true) */
  interactive?: boolean;
  /** Whether continuous animation is enabled (default: true) */
  motion?: boolean;
  /** Vertical relative anchor for the laser-wave hotspot intersection (0 to 1, default: 0.52) */
  hotspotY?: number;
  /** Laser beam glow intensity multiplier (default: 1.0) */
  beamIntensity?: number;
  /** Show play/pause motion control button (default: false) */
  showControls?: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// 4x4 Bayer dither matrix for authentic halftone ordered dither
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function HeroBlueLaserBackground({
  variant = "hero",
  className,
  interactive = true,
  motion = true,
  hotspotY = 0.52,
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

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Smoothed mouse state
    const mouse = {
      targetX: 0.5,
      targetY: 0.5,
      currentX: 0.5,
      currentY: 0.5,
      canvasX: -1000,
      canvasY: -1000,
      active: false,
    };

    // Particle sparks drifting along the laser & wave
    const sparks: Spark[] = [];
    const MAX_SPARKS = 36;

    const initSparks = (w: number, h: number) => {
      sparks.length = 0;
      for (let i = 0; i < MAX_SPARKS; i++) {
        const alongBeam = Math.random() < 0.65;
        const centerX = w * 0.5;
        sparks.push({
          x: alongBeam ? centerX + (Math.random() - 0.5) * 80 : Math.random() * w,
          y: alongBeam ? Math.random() * h : h * hotspotY + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 0.4,
          vy: alongBeam ? -(Math.random() * 1.4 + 0.6) : (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.8 + 0.2,
          life: Math.random() * 120,
          maxLife: 120 + Math.random() * 100,
        });
      }
    };

    const resize = () => {
      if (!container || !canvas) return;
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

      initSparks(width, height);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      mouse.targetX = Math.max(0, Math.min(1, px));
      mouse.targetY = Math.max(0, Math.min(1, py));
      mouse.canvasX = e.clientX - rect.left;
      mouse.canvasY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.targetX = 0.5;
      mouse.targetY = 0.5;
      mouse.canvasX = -1000;
      mouse.canvasY = -1000;
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = motion && !prefersReducedMotion && !paused;

    let startTime = performance.now();
    let lastTime = startTime;

    const renderFrame = (now: number) => {
      if (!ctx || width === 0 || height === 0) return;

      const elapsed = (now - startTime) * 0.001;
      const delta = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;

      // Mouse lerping for organic, smooth fluidity
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.06;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.06;

      // Dynamic central laser beam position with subtle cursor sway
      const beamX = width * 0.5 + (mouse.currentX - 0.5) * 54 + Math.sin(elapsed * 0.7) * 4;
      const currentHotspotY = height * hotspotY + (mouse.currentY - 0.5) * 38;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // -------------------------------------------------------------
      // 1. BASE BACKGROUND & ATMOSPHERIC GLOW
      // -------------------------------------------------------------
      // Deep midnight navy base fill (#030305 to #05070f)
      const bgGrad = ctx.createRadialGradient(
        beamX,
        currentHotspotY * 0.9,
        20,
        beamX,
        currentHotspotY,
        Math.max(width, height) * 0.75,
      );
      bgGrad.addColorStop(0, "#080c1b");
      bgGrad.addColorStop(0.35, "#050711");
      bgGrad.addColorStop(1, "#030305");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Wide soft atmospheric blue haze behind everything
      const hazeGrad = ctx.createRadialGradient(
        beamX,
        currentHotspotY,
        10,
        beamX,
        currentHotspotY,
        Math.min(width, height) * 0.65,
      );
      hazeGrad.addColorStop(0, "rgba(0, 136, 255, 0.16)");
      hazeGrad.addColorStop(0.3, "rgba(0, 90, 220, 0.09)");
      hazeGrad.addColorStop(0.7, "rgba(3, 10, 30, 0.03)");
      hazeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // 2. EQUALIZER / SOUNDWAVE FORMULA
      // -------------------------------------------------------------
      const getWaveY = (x: number, t: number) => {
        // Multi-frequency sinusoidal harmonics for organic ribbon wave
        const wave1 = Math.sin(x * 0.0032 + t * 1.1) * 26;
        const wave2 = Math.cos(x * 0.0075 - t * 0.75) * 14;
        const wave3 = Math.sin(x * 0.014 + t * 1.4) * 6;
        // Crest boost near the vertical laser intersection
        const distToBeam = Math.abs(x - beamX);
        const beamInfluence = Math.exp(-(distToBeam * distToBeam) / (2 * 140 * 140));
        const crest = Math.sin(t * 2.2) * 8 * beamInfluence;

        return currentHotspotY + wave1 + wave2 + wave3 + crest;
      };

      // -------------------------------------------------------------
      // 3. EQUALIZER WAVE RIBBON FILAMENTS (LUMINOUS TRAILS)
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const waveConfigs = [
        { offset: -16, baseAlpha: 0.18, lineWidth: 1.0 },
        { offset: 0, baseAlpha: 0.35, lineWidth: 1.8 },
        { offset: 16, baseAlpha: 0.18, lineWidth: 1.0 },
      ] as const;

      for (const config of waveConfigs) {
        const yOff = config.offset;
        const alpha = config.baseAlpha * beamIntensity;

        ctx.beginPath();
        const stepX = 14;
        for (let x = 0; x <= width + stepX; x += stepX) {
          const y = getWaveY(x, elapsed) + yOff;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
        waveGrad.addColorStop(0, "rgba(0, 136, 255, 0)");
        waveGrad.addColorStop(Math.max(0, (beamX - 250) / width), "rgba(0, 136, 255, 0.15)");
        waveGrad.addColorStop(
          Math.max(0, Math.min(1, beamX / width)),
          `rgba(0, 220, 255, ${alpha})`,
        );
        waveGrad.addColorStop(Math.min(1, (beamX + 250) / width), "rgba(0, 136, 255, 0.15)");
        waveGrad.addColorStop(1, "rgba(0, 136, 255, 0)");

        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = config.lineWidth;
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 4. VERTICAL LASER SHAFT / BEAM (Linear / DesignCode signature)
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // A. Wide Volumetric Atmospheric Laser Column
      const colGrad = ctx.createLinearGradient(beamX - 180, 0, beamX + 180, 0);
      colGrad.addColorStop(0, "rgba(0, 136, 255, 0)");
      colGrad.addColorStop(0.35, `rgba(0, 140, 255, ${0.06 * beamIntensity})`);
      colGrad.addColorStop(0.5, `rgba(0, 180, 255, ${0.14 * beamIntensity})`);
      colGrad.addColorStop(0.65, `rgba(0, 140, 255, ${0.06 * beamIntensity})`);
      colGrad.addColorStop(1, "rgba(0, 136, 255, 0)");
      ctx.fillStyle = colGrad;
      ctx.fillRect(beamX - 180, 0, 360, height);

      // B. Electric Cyan Focused Beam Aura
      const beamAura = ctx.createLinearGradient(beamX - 40, 0, beamX + 40, 0);
      beamAura.addColorStop(0, "rgba(0, 212, 255, 0)");
      beamAura.addColorStop(0.4, `rgba(0, 212, 255, ${0.28 * beamIntensity})`);
      beamAura.addColorStop(0.5, `rgba(180, 245, 255, ${0.45 * beamIntensity})`);
      beamAura.addColorStop(0.6, `rgba(0, 212, 255, ${0.28 * beamIntensity})`);
      beamAura.addColorStop(1, "rgba(0, 212, 255, 0)");
      ctx.fillStyle = beamAura;
      ctx.fillRect(beamX - 40, 0, 80, height);

      // C. Razor-Sharp Ultra-Bright Laser Core
      const coreGrad = ctx.createLinearGradient(beamX - 3.5, 0, beamX + 3.5, 0);
      coreGrad.addColorStop(0, "rgba(0, 212, 255, 0)");
      coreGrad.addColorStop(0.2, "rgba(180, 245, 255, 0.7)");
      coreGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.98)");
      coreGrad.addColorStop(0.8, "rgba(180, 245, 255, 0.7)");
      coreGrad.addColorStop(1, "rgba(0, 212, 255, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(beamX - 3.5, 0, 7, height);

      // D. Laser Hotspot Glow at Intersection
      const hotspotGrad = ctx.createRadialGradient(
        beamX,
        currentHotspotY,
        2,
        beamX,
        currentHotspotY,
        140,
      );
      hotspotGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      hotspotGrad.addColorStop(0.12, "rgba(140, 235, 255, 0.82)");
      hotspotGrad.addColorStop(0.35, "rgba(0, 180, 255, 0.45)");
      hotspotGrad.addColorStop(0.7, "rgba(0, 100, 255, 0.12)");
      hotspotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = hotspotGrad;
      ctx.beginPath();
      ctx.arc(beamX, currentHotspotY, 140, 0, Math.PI * 2);
      ctx.fill();

      // E. Anamorphic Horizontal Glare Line through Hotspot
      const flareGrad = ctx.createLinearGradient(beamX - 220, 0, beamX + 220, 0);
      flareGrad.addColorStop(0, "rgba(0, 212, 255, 0)");
      flareGrad.addColorStop(0.35, "rgba(0, 212, 255, 0.28)");
      flareGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
      flareGrad.addColorStop(0.65, "rgba(0, 212, 255, 0.28)");
      flareGrad.addColorStop(1, "rgba(0, 212, 255, 0)");
      ctx.fillStyle = flareGrad;
      ctx.fillRect(beamX - 220, currentHotspotY - 1, 440, 2);

      ctx.restore();

      // -------------------------------------------------------------
      // 5. HALFTONE STIPPLE GRID (BRAILLE / ORDERED DITHER MATRIX)
      // -------------------------------------------------------------
      const isMobile = width < 768;
      const step = isMobile ? 24 : 18;
      const startX = (width % step) * 0.5;
      const startY = (height % step) * 0.5;

      // High-performance batching: 4 Path2D tiers to render 5,000+ dots in 4 draw calls
      const tier1Path = new Path2D(); // Ambient matrix dots (subtle blue-navy)
      const tier2Path = new Path2D(); // Electric blue dots (medium intensity)
      const tier3Path = new Path2D(); // Neon cyan dots (high intensity)
      const tier4Path = new Path2D(); // Core blue-white glowing dots (peak hotspot / beam)

      const mouseCanvasX = mouse.canvasX;
      const mouseCanvasY = mouse.canvasY;
      const hasMouse = mouse.active && mouseCanvasX > -100;

      let colIdx = 0;
      for (let x = startX; x < width; x += step) {
        let rowIdx = 0;
        const bayerRow = BAYER_4X4[colIdx % 4] ?? [0, 0, 0, 0];

        // Beam distance factor
        const dxBeam = Math.abs(x - beamX);
        const fBeam = Math.exp(-(dxBeam * dxBeam) / (2 * 135 * 135));

        // Wave center at this X
        const waveYAtX = getWaveY(x, elapsed);

        for (let y = startY; y < height; y += step) {
          // Wave distance factor
          const dyWave = Math.abs(y - waveYAtX);
          const fWave = Math.exp(-(dyWave * dyWave) / (2 * 68 * 68));

          // Hotspot radial distance factor
          const dxHotspot = x - beamX;
          const dyHotspot = y - currentHotspotY;
          const distHotspotSq = dxHotspot * dxHotspot + dyHotspot * dyHotspot;
          const fHotspot = Math.exp(-distHotspotSq / (2 * 155 * 155));

          // Interactive mouse displacement & ripple
          let drawX = x;
          let drawY = y;
          let fMouse = 0;

          if (hasMouse) {
            const dxM = x - mouseCanvasX;
            const dyM = y - mouseCanvasY;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);

            if (distM < 230 && distM > 0.1) {
              const rippleFactor = (1 - distM / 230) ** 1.8;
              // Smooth outward displacement
              const displaceAmount = rippleFactor * 16;
              drawX += (dxM / distM) * displaceAmount;
              drawY += (dyM / distM) * displaceAmount;

              // Wave excitation ripple
              fMouse = Math.cos(distM * 0.045 - elapsed * 4) * rippleFactor * 0.45;
            }
          }

          // Bayer ordered dither offset (-0.05 to +0.05)
          const ditherValue = bayerRow[rowIdx % 4] ?? 0;
          const dither = (ditherValue / 16 - 0.5) * 0.1;

          // Composite Halftone Dot Intensity
          const intensity = Math.max(
            0,
            Math.min(
              1,
              0.08 +
                dither +
                fBeam * 0.62 * beamIntensity +
                fWave * 0.72 +
                fHotspot * 1.15 * beamIntensity +
                fMouse,
            ),
          );

          // Dot radius calculation: ranges from 0.7px up to 3.5px
          const radius = 0.7 + Math.pow(intensity, 1.3) * 2.8;

          // Categorize into rendering tiers for optimal performance
          if (intensity < 0.22) {
            tier1Path.moveTo(drawX + radius, drawY);
            tier1Path.arc(drawX, drawY, radius, 0, Math.PI * 2);
          } else if (intensity < 0.52) {
            tier2Path.moveTo(drawX + radius, drawY);
            tier2Path.arc(drawX, drawY, radius, 0, Math.PI * 2);
          } else if (intensity < 0.8) {
            tier3Path.moveTo(drawX + radius, drawY);
            tier3Path.arc(drawX, drawY, radius, 0, Math.PI * 2);
          } else {
            tier4Path.moveTo(drawX + radius, drawY);
            tier4Path.arc(drawX, drawY, radius, 0, Math.PI * 2);
          }

          rowIdx++;
        }
        colIdx++;
      }

      // Draw Tier 1: Ambient background stipple matrix
      ctx.fillStyle = "rgba(40, 70, 130, 0.26)";
      ctx.fill(tier1Path);

      // Draw Tier 2: Electric Blue dots
      ctx.fillStyle = "rgba(0, 136, 255, 0.58)";
      ctx.fill(tier2Path);

      // Draw Tier 3: Neon Cyan dots
      ctx.fillStyle = "rgba(0, 212, 255, 0.85)";
      ctx.fill(tier3Path);

      // Draw Tier 4: Brilliant White-Cyan Hotspot Core dots with glow
      ctx.save();
      ctx.fillStyle = "rgba(240, 250, 255, 0.98)";
      ctx.shadowColor = "rgba(0, 212, 255, 0.85)";
      ctx.shadowBlur = 8;
      ctx.fill(tier4Path);
      ctx.restore();

      // -------------------------------------------------------------
      // 6. ENERGETIC PARTICLE SPARKS (STREAMERS ALONG THE SHAFT & WAVE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const s of sparks) {
        if (!s) continue;
        if (shouldAnimate) {
          s.x += s.vx;
          s.y += s.vy;
          s.life++;

          // Reset particle when lifespan ends or goes out of screen
          if (s.life >= s.maxLife || s.y < 0 || s.y > height || s.x < 0 || s.x > width) {
            const alongBeam = Math.random() < 0.7;
            s.x = alongBeam ? beamX + (Math.random() - 0.5) * 60 : Math.random() * width;
            s.y = alongBeam
              ? height * 0.9 + Math.random() * 50
              : getWaveY(s.x, elapsed) + (Math.random() - 0.5) * 80;
            s.vx = (Math.random() - 0.5) * 0.5;
            s.vy = alongBeam ? -(Math.random() * 1.5 + 0.6) : (Math.random() - 0.5) * 0.7;
            s.life = 0;
            s.maxLife = 100 + Math.random() * 120;
          }
        }

        const lifeRatio = s.life / s.maxLife;
        const currentAlpha = Math.sin(lifeRatio * Math.PI) * s.alpha;

        ctx.fillStyle = `rgba(180, 240, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 7. BOTTOM FADE-OUT GRADIENT SHADE (SEAMLESS PAGE INTEGRATION)
      // -------------------------------------------------------------
      if (variant === "hero" || variant === "top") {
        const fadeGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
        fadeGrad.addColorStop(0, "rgba(11, 14, 20, 0)");
        fadeGrad.addColorStop(0.65, "rgba(11, 14, 20, 0.75)");
        fadeGrad.addColorStop(1, "rgba(11, 14, 20, 1)");
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, height * 0.72, width, height * 0.28);
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
          lastTime = startTime;
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
        lastTime = startTime;
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
          id={`laser-canvas-${componentId}`}
          className="block w-full h-full pointer-events-none"
        />
      </div>

      {showControls && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-50 grid h-9 w-9 place-items-center rounded-full border border-sky-400/20 bg-slate-900/80 text-sky-300 backdrop-blur transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-400"
          aria-label={paused ? "Play background animation" : "Pause background animation"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        </button>
      )}
    </>
  );
}
