/**
 * ============================================================================
 * LIQUID CURSOR REVEAL EFFECT (Vanilla JS)
 * ============================================================================
 * Renders a gooey liquid metaball blob that tracks cursor movement.
 * Masks and reveals a colorful background image (/assets/smoke.jpg) inside
 * the blob while preserving the dark grid background outside the blob.
 */

// ============================================================================
// TWEAKABLE CONSTANTS
// ============================================================================
const BLUR = 16;                  // Blur radius for metaball merging (px)
const TRAIL_LIFETIME = 700;       // Lifespan of trail circles (ms)
const BLOB_RADIUS = 55;           // Base radius of the main cursor blob (px)
const DROPLET_CHANCE = 0.12;      // Probability of spawning satellite droplets per step
const EASING = 0.15;              // Pointer lerp easing factor (fluid laggy feel)
const IMAGE_URL = "/assets/smoke.jpg"; // Path to colorful reveal image

(function () {
  const canvas = document.getElementById("liquid-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  // Offscreen canvases for metaball circle drawing and blurred thresholding
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d", { alpha: true });

  const blurredMaskCanvas = document.createElement("canvas");
  const blurredMaskCtx = blurredMaskCanvas.getContext("2d", {
    alpha: true,
    willReadFrequently: true,
  });

  if (!maskCtx || !blurredMaskCtx) return;

  // Preload reveal image
  const smokeImage = new Image();
  let imageLoaded = false;
  smokeImage.src = IMAGE_URL;
  smokeImage.onload = () => { imageLoaded = true; };

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    width = Math.max(Math.round(rect.width), 320);
    height = Math.max(Math.round(rect.height), 240);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.scale(dpr, dpr);

    blurredMaskCanvas.width = canvas.width;
    blurredMaskCanvas.height = canvas.height;
    blurredMaskCtx.setTransform(1, 0, 0, 1, 0, 0);
    blurredMaskCtx.scale(dpr, dpr);
  }

  // Pointer tracking
  let pointerTargetX = -1000;
  let pointerTargetY = -1000;
  let pointerCurrentX = -1000;
  let pointerCurrentY = -1000;
  let prevX = -1000;
  let prevY = -1000;
  let isPointerInside = false;
  let lastMoveTime = 0;
  let autoTime = 0;

  const trail = [];
  const droplets = [];

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    pointerTargetX = e.clientX - rect.left;
    pointerTargetY = e.clientY - rect.top;
    isPointerInside = true;
    lastMoveTime = performance.now();
  }

  function onPointerLeave() {
    isPointerInside = false;
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.addEventListener("mouseleave", onPointerLeave);

  function drawCoverImage(targetCtx, img, canvasW, canvasH, offsetX, offsetY, zoom) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;
    let drawW = canvasW * zoom;
    let drawH = canvasH * zoom;

    if (canvasRatio > imgRatio) {
      drawW = canvasW * zoom;
      drawH = (canvasW / imgRatio) * zoom;
    } else {
      drawH = canvasH * zoom;
      drawW = (canvasH * imgRatio) * zoom;
    }

    const dx = (canvasW - drawW) * 0.5 + offsetX;
    const dy = (canvasH - drawH) * 0.5 + offsetY;
    targetCtx.drawImage(img, dx, dy, drawW, drawH);
  }

  const startTime = performance.now();

  function tick(now) {
    const elapsed = (now - startTime) * 0.001;

    // 1. Pointer easing with lerp
    const isIdle = now - lastMoveTime > 2500 && !isPointerInside;
    if (isIdle) {
      autoTime += 0.016;
      pointerTargetX = width * 0.5 + Math.sin(autoTime * 0.9) * (width * 0.28);
      pointerTargetY = height * 0.45 + Math.cos(autoTime * 1.3) * (height * 0.18);
    }

    if (pointerTargetX > -500) {
      if (pointerCurrentX < -500) {
        pointerCurrentX = pointerTargetX;
        pointerCurrentY = pointerTargetY;
        prevX = pointerCurrentX;
        prevY = pointerCurrentY;
      } else {
        pointerCurrentX += (pointerTargetX - pointerCurrentX) * EASING;
        pointerCurrentY += (pointerTargetY - pointerCurrentY) * EASING;
      }
    }

    // 2. Interpolate path & spawn circles
    if (pointerCurrentX > -500 && (isPointerInside || isIdle)) {
      const dist = Math.hypot(pointerCurrentX - prevX, pointerCurrentY - prevY);
      const stepDist = Math.max(BLOB_RADIUS * 0.32, 12);
      const steps = Math.max(1, Math.min(Math.ceil(dist / stepDist), 20));

      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const interpX = prevX + (pointerCurrentX - prevX) * t;
        const interpY = prevY + (pointerCurrentY - prevY) * t;

        trail.push({
          x: interpX,
          y: interpY,
          radius: BLOB_RADIUS * (0.85 + Math.random() * 0.3),
          birth: now,
          lifetime: TRAIL_LIFETIME,
        });

        if (Math.random() < DROPLET_CHANCE) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.8 + 1.2;
          droplets.push({
            x: interpX,
            y: interpY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: BLOB_RADIUS * (Math.random() * 0.22 + 0.18),
            birth: now,
            lifetime: TRAIL_LIFETIME * 0.85,
          });
        }
      }

      prevX = pointerCurrentX;
      prevY = pointerCurrentY;
    }

    // 3. Draw circles onto offscreen mask canvas
    maskCtx.clearRect(0, 0, width, height);

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let count = 0;

    for (let i = trail.length - 1; i >= 0; i--) {
      const c = trail[i];
      const age = now - c.birth;
      if (age >= c.lifetime) {
        trail.splice(i, 1);
        continue;
      }
      const r = c.radius * (1 - age / c.lifetime);
      if (r <= 0.5) continue;

      maskCtx.beginPath();
      maskCtx.arc(c.x, c.y, r, 0, Math.PI * 2);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fill();

      minX = Math.min(minX, c.x - r);
      minY = Math.min(minY, c.y - r);
      maxX = Math.max(maxX, c.x + r);
      maxY = Math.max(maxY, c.y + r);
      count++;
    }

    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i];
      const age = now - d.birth;
      if (age >= d.lifetime) {
        droplets.splice(i, 1);
        continue;
      }
      d.x += d.vx;
      d.y += d.vy;
      d.vx *= 0.96;
      d.vy *= 0.96;

      const r = d.radius * (1 - age / d.lifetime);
      if (r <= 0.5) continue;

      maskCtx.beginPath();
      maskCtx.arc(d.x, d.y, r, 0, Math.PI * 2);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fill();

      minX = Math.min(minX, d.x - r);
      minY = Math.min(minY, d.y - r);
      maxX = Math.max(maxX, d.x + r);
      maxY = Math.max(maxY, d.y + r);
      count++;
    }

    // 4. Metaball Blur + Threshold
    ctx.clearRect(0, 0, width, height);

    if (count > 0) {
      const pad = BLUR * 3;
      const bx = Math.max(0, Math.floor(minX - pad));
      const by = Math.max(0, Math.floor(minY - pad));
      const bw = Math.min(width - bx, Math.ceil(maxX - minX + pad * 2));
      const bh = Math.min(height - by, Math.ceil(maxY - minY + pad * 2));

      if (bw > 0 && bh > 0) {
        blurredMaskCtx.clearRect(0, 0, width, height);
        blurredMaskCtx.save();
        blurredMaskCtx.filter = "blur(" + BLUR + "px)";
        blurredMaskCtx.drawImage(maskCanvas, 0, 0);
        blurredMaskCtx.restore();

        try {
          const dprBx = Math.floor(bx * dpr);
          const dprBy = Math.floor(by * dpr);
          const dprBw = Math.min(blurredMaskCanvas.width - dprBx, Math.ceil(bw * dpr));
          const dprBh = Math.min(blurredMaskCanvas.height - dprBy, Math.ceil(bh * dpr));

          if (dprBw > 0 && dprBh > 0) {
            const imgData = blurredMaskCtx.getImageData(dprBx, dprBy, dprBw, dprBh);
            const data32 = new Uint32Array(imgData.data.buffer);

            for (let idx = 0; idx < data32.length; idx++) {
              const alpha = (data32[idx] >> 24) & 0xff;
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
        } catch (err) {
          // Fallback if image data read fails
        }

        // Soft outer glow with subtle cyan/pink tint
        ctx.save();
        ctx.filter = "blur(18px)";
        ctx.globalAlpha = 0.38;
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.restore();

        // Composite colorful smoke image through the gooey blob mask
        ctx.save();
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-in";

        if (imageLoaded) {
          const parallaxX = Math.sin(elapsed * 0.28) * 28 + (pointerCurrentX - width * 0.5) * 0.05;
          const parallaxY = Math.cos(elapsed * 0.22) * 22 + (pointerCurrentY - height * 0.5) * 0.05;
          const zoom = 1.06 + Math.sin(elapsed * 0.18) * 0.03;
          drawCoverImage(ctx, smokeImage, width, height, parallaxX, parallaxY, zoom);
        } else {
          ctx.fillStyle = "#ff0077";
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();

        // Thin specular liquid rim
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.25;
        ctx.filter = "blur(2.5px)";
        ctx.drawImage(blurredMaskCanvas, 0, 0);
        ctx.restore();
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
})();

