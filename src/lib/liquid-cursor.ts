/**
 * ============================================================================
 * LIQUID CURSOR REVEAL EFFECT
 * ============================================================================
 * Vanilla JS/TS liquid gooey cursor reveal engine.
 * Renders a metaball liquid blob that tracks the pointer and acts as a mask
 * revealing a colorful underlying image (e.g. smoke.jpg), while keeping the
 * dark grid background visible outside the blob.
 */

// ============================================================================
// TWEAKABLE CONSTANTS (As specified in requirements)
// ============================================================================
export const BLUR = 16; // Blur radius for metaball merging (px)
export const TRAIL_LIFETIME = 700; // Lifespan of trail circles (ms)
export const BLOB_RADIUS = 55; // Base radius of the main cursor blob (px)
export const DROPLET_CHANCE = 0.12; // Probability of spawning satellite droplets per step
export const EASING = 0.15; // Pointer lerp easing factor (fluid & laggy feel)
export const IMAGE_URL = "/assets/smoke.jpg"; // Path to the colorful reveal image

export interface LiquidCursorOptions {
  canvas: HTMLCanvasElement;
  imageUrl?: string;
  blur?: number;
  trailLifetime?: number;
  blobRadius?: number;
  dropletChance?: number;
  easing?: number;
}

interface TrailCircle {
  x: number;
  y: number;
  radius: number;
  birth: number;
  lifetime: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  birth: number;
  lifetime: number;
}

/**
 * Initializes the liquid cursor reveal effect on the given canvas element.
 * Returns a teardown function to clean up listeners and animation frames.
 */
export function initLiquidCursor(options: LiquidCursorOptions) {
  const {
    canvas,
    imageUrl = IMAGE_URL,
    blur = BLUR,
    trailLifetime = TRAIL_LIFETIME,
    blobRadius = BLOB_RADIUS,
    dropletChance = DROPLET_CHANCE,
    easing = EASING,
  } = options;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};

  // Offscreen canvas for drawing individual circles
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d", { alpha: true });

  // Offscreen canvas for applying the blur and alpha contrast threshold
  const blurredMaskCanvas = document.createElement("canvas");
  const blurredMaskCtx = blurredMaskCanvas.getContext("2d", {
    alpha: true,
    willReadFrequently: true,
  });

  if (!maskCtx || !blurredMaskCtx) return () => {};

  // Preload the colorful reveal image
  const smokeImage = new Image();
  let imageLoaded = false;
  smokeImage.src = imageUrl;
  smokeImage.onload = () => {
    imageLoaded = true;
  };

  // Dimensions & DPR handling
  let width = 0;
  let height = 0;
  let dpr = 1;

  const resize = () => {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    width = Math.max(Math.round(rect.width), 320);
    height = Math.max(Math.round(rect.height), 240);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Size main canvas
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Size offscreen mask canvases
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.scale(dpr, dpr);

    blurredMaskCanvas.width = canvas.width;
    blurredMaskCanvas.height = canvas.height;
    blurredMaskCtx.setTransform(1, 0, 0, 1, 0, 0);
    blurredMaskCtx.scale(dpr, dpr);
  };

  // State: Eased Pointer Tracking
  let pointerTargetX = -1000;
  let pointerTargetY = -1000;
  let pointerCurrentX = -1000;
  let pointerCurrentY = -1000;
  let prevX = -1000;
  let prevY = -1000;
  let isPointerInside = false;
  let lastMoveTime = 0;

  // Active metaball particles
  const trail: TrailCircle[] = [];
  const droplets: Droplet[] = [];

  // Pointer event listeners on window so inputs and buttons remain clickable
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerTargetX = e.clientX - rect.left;
    pointerTargetY = e.clientY - rect.top;
    isPointerInside = true;
    lastMoveTime = performance.now();
  };

  const onPointerLeave = () => {
    isPointerInside = false;
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.addEventListener("mouseleave", onPointerLeave);

  // Auto-drifting blob on touch or idle visitors (Requirement 9)
  let autoTime = 0;

  // Helper: Draw image with object-fit: cover and parallax
  const drawCoverImage = (
    targetCtx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasW: number,
    canvasH: number,
    offsetX = 0,
    offsetY = 0,
    zoom = 1.05,
  ) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;
    let drawW = canvasW * zoom;
    let drawH = canvasH * zoom;

    if (canvasRatio > imgRatio) {
      drawW = canvasW * zoom;
      drawH = (canvasW / imgRatio) * zoom;
    } else {
      drawH = canvasH * zoom;
      drawW = canvasH * imgRatio * zoom;
    }

    const dx = (canvasW - drawW) * 0.5 + offsetX;
    const dy = (canvasH - drawH) * 0.5 + offsetY;

    targetCtx.drawImage(img, dx, dy, drawW, drawH);
  };

  let animationFrameId = 0;
  let isDisposed = false;
  const startTime = performance.now();

  const tick = (now: number) => {
    if (isDisposed) return;

    const elapsed = (now - startTime) * 0.001;

    // 1. POINTER EASING WITH LERP (Fluid, laggy feel)
    const isIdle = now - lastMoveTime > 2500 && !isPointerInside;

    if (isIdle) {
      // Gentle auto-moving organic drift when idle or on mobile
      autoTime += 0.016;
      const autoX = width * 0.5 + Math.sin(autoTime * 0.9) * (width * 0.28);
      const autoY = height * 0.45 + Math.cos(autoTime * 1.3) * (height * 0.18);
      pointerTargetX = autoX;
      pointerTargetY = autoY;
    }

    if (pointerTargetX > -500) {
      if (pointerCurrentX < -500) {
        pointerCurrentX = pointerTargetX;
        pointerCurrentY = pointerTargetY;
        prevX = pointerCurrentX;
        prevY = pointerCurrentY;
      } else {
        pointerCurrentX += (pointerTargetX - pointerCurrentX) * easing;
        pointerCurrentY += (pointerTargetY - pointerCurrentY) * easing;
      }
    }

    // 2. SPAWN CIRCLES ALONG THE TRAIL (Interpolated for smooth continuity)
    if (pointerCurrentX > -500 && (isPointerInside || isIdle)) {
      const dist = Math.hypot(pointerCurrentX - prevX, pointerCurrentY - prevY);
      const stepDist = Math.max(blobRadius * 0.32, 12);
      const steps = Math.max(1, Math.min(Math.ceil(dist / stepDist), 20));

      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const interpX = prevX + (pointerCurrentX - prevX) * t;
        const interpY = prevY + (pointerCurrentY - prevY) * t;

        // Add trail circle
        trail.push({
          x: interpX,
          y: interpY,
          radius: blobRadius * (0.85 + Math.random() * 0.3),
          birth: now,
          lifetime: trailLifetime,
        });

        // 3. SPAWN SATELLITE DROPLETS (Requirement 2)
        if (Math.random() < dropletChance) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.8 + 1.2;
          droplets.push({
            x: interpX,
            y: interpY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: blobRadius * (Math.random() * 0.22 + 0.18),
            birth: now,
            lifetime: trailLifetime * 0.85,
          });
        }
      }

      prevX = pointerCurrentX;
      prevY = pointerCurrentY;
    }

    // 4. DRAW CIRCLES TO OFFSCREEN MASK CANVAS
    maskCtx.clearRect(0, 0, width, height);

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let activeCircleCount = 0;

    // Draw & age trail circles
    for (let i = trail.length - 1; i >= 0; i--) {
      const c = trail[i]!;
      const age = now - c.birth;
      if (age >= c.lifetime) {
        trail.splice(i, 1);
        continue;
      }

      const progress = age / c.lifetime;
      const currentRadius = c.radius * (1 - progress);
      if (currentRadius <= 0.5) continue;

      maskCtx.beginPath();
      maskCtx.arc(c.x, c.y, currentRadius, 0, Math.PI * 2);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fill();

      // Bounding box tracking for high-performance thresholding
      minX = Math.min(minX, c.x - currentRadius);
      minY = Math.min(minY, c.y - currentRadius);
      maxX = Math.max(maxX, c.x + currentRadius);
      maxY = Math.max(maxY, c.y + currentRadius);
      activeCircleCount++;
    }

    // Draw & update satellite droplets
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i]!;
      const age = now - d.birth;
      if (age >= d.lifetime) {
        droplets.splice(i, 1);
        continue;
      }

      d.x += d.vx;
      d.y += d.vy;
      d.vx *= 0.96;
      d.vy *= 0.96;

      const progress = age / d.lifetime;
      const currentRadius = d.radius * (1 - progress);
      if (currentRadius <= 0.5) continue;

      maskCtx.beginPath();
      maskCtx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fill();

      minX = Math.min(minX, d.x - currentRadius);
      minY = Math.min(minY, d.y - currentRadius);
      maxX = Math.max(maxX, d.x + currentRadius);
      maxY = Math.max(maxY, d.y + currentRadius);
      activeCircleCount++;
    }

    // 5. METABALL MERGING: BLUR + ALPHA CONTRAST THRESHOLD
    ctx.clearRect(0, 0, width, height);

    if (activeCircleCount > 0) {
      const pad = blur * 3;
      const bx = Math.max(0, Math.floor(minX - pad));
      const by = Math.max(0, Math.floor(minY - pad));
      const bw = Math.min(width - bx, Math.ceil(maxX - minX + pad * 2));
      const bh = Math.min(height - by, Math.ceil(maxY - minY + pad * 2));

      if (bw > 0 && bh > 0) {
        // Blur offscreen mask
        blurredMaskCtx.clearRect(0, 0, width, height);
        blurredMaskCtx.save();
        blurredMaskCtx.filter = `blur(${blur}px)`;
        blurredMaskCtx.drawImage(maskCanvas, 0, 0);
        blurredMaskCtx.restore();

        // High-performance Uint32 alpha contrast threshold over the active bounding box
        try {
          const dprBx = Math.floor(bx * dpr);
          const dprBy = Math.floor(by * dpr);
          const dprBw = Math.min(blurredMaskCanvas.width - dprBx, Math.ceil(bw * dpr));
          const dprBh = Math.min(blurredMaskCanvas.height - dprBy, Math.ceil(bh * dpr));

          if (dprBw > 0 && dprBh > 0) {
            const imgData = blurredMaskCtx.getImageData(dprBx, dprBy, dprBw, dprBh);
            const data32 = new Uint32Array(imgData.data.buffer);

            // Fast alpha threshold loop
            for (let idx = 0; idx < data32.length; idx++) {
              const alpha = (data32[idx]! >> 24) & 0xff;
              if (alpha > 135) {
                data32[idx] = 0xffffffff;
              } else if (alpha > 95) {
                const smoothAlpha = Math.round(((alpha - 95) / 40) * 255);
                data32[idx] = (smoothAlpha << 24) | 0x00ffffff;
              } else {
                data32[idx] = 0;
              }
            }
            blurredMaskCtx.putImageData(imgData, dprBx, dprBy);
          }
        } catch {
          // Fallback if readback fails
        }

        // 6. DRAW SOFT GLOW & THIN LIGHT RIM (Requirement 5)
        ctx.save();
        ctx.filter = "blur(18px)";
        ctx.globalAlpha = 0.38;
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.restore();

        // 7. COMPOSITE REVEAL IMAGE (smoke.jpg with source-in mask & parallax)
        ctx.save();
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-in";

        if (imageLoaded) {
          // Slow parallax drift
          const parallaxX = Math.sin(elapsed * 0.28) * 28 + (pointerCurrentX - width * 0.5) * 0.05;
          const parallaxY = Math.cos(elapsed * 0.22) * 22 + (pointerCurrentY - height * 0.5) * 0.05;
          const zoom = 1.06 + Math.sin(elapsed * 0.18) * 0.03;

          drawCoverImage(ctx, smokeImage, width, height, parallaxX, parallaxY, zoom);
        } else {
          // Vibrant fallback gradient while image loads
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#0088ff");
          grad.addColorStop(0.5, "#ff007f");
          grad.addColorStop(1, "#ffaa00");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();

        // 8. SPECULAR LIGHT RIM
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.25;
        ctx.filter = "blur(2.5px)";
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.restore();
      }
    }

    animationFrameId = requestAnimationFrame(tick);
  };

  // ResizeObserver for responsive layout
  const resizeObserver = new ResizeObserver(resize);
  if (canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
  }
  resize();

  // Start 60fps render loop
  animationFrameId = requestAnimationFrame(tick);

  // Return teardown function
  return () => {
    isDisposed = true;
    cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    document.removeEventListener("mouseleave", onPointerLeave);
  };
}
