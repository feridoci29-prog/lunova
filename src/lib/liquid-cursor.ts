/**
 * ============================================================================
 * LIQUID CURSOR REVEAL EFFECT (WebGL Glass-Smooth Engine)
 * ============================================================================
 * Features:
 * 1. Critically damped spring follow for the cursor head.
 * 2. Catmull-Rom spline interpolation along the trail path for kink-free strokes.
 * 3. Organic metaball field: cubic kernel + procedural noise displacement.
 * 4. Smoke image cover mapping with parallax drift, inner shade & specular rim.
 * 5. Drop shadow offset bottom-right (theme-aware color) behind blob & droplets.
 * 6. Irregular multi-circle droplets with individual smoke UV offsets & shadows.
 * 7. Live text mask rasterization of [data-liquid-invert] elements with pure white
 *    (light theme) or deep charcoal (dark theme) inversion inside the blob.
 * 8. Tiny dot (6px) at the spring head position.
 * 9. Live theme detection via MutationObserver without reinitialization.
 * 10. Complete lifecycle cleanup for React StrictMode compatibility.
 */

export const BLUR = 16;
export const TRAIL_LIFETIME = 600; // ms per point
export const BLOB_RADIUS = 56; // Max base radius
export const DROPLET_CHANCE = 0.3;
export const EASING = 0.15;
export const IMAGE_URL = "/assets/smoke.jpg";
export const IDLE_TIMEOUT = 600;
export const SHRINK_SPEED = 0.06;

export interface LiquidCursorOptions {
  canvas: HTMLCanvasElement;
  imageUrl?: string;
  blur?: number;
  trailLifetime?: number;
  blobRadius?: number;
  dropletChance?: number;
  easing?: number;
  idleTimeout?: number;
  shrinkSpeed?: number;
  invertSelector?: string;
}

interface TrailPoint {
  x: number;
  y: number;
  radius: number;
  birth: number;
  lifetime: number;
}

interface DropletSubCircle {
  ox: number;
  oy: number;
  rScale: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  birth: number;
  lifetime: number;
  uvOffset: [number, number]; // Random UV offset for individual droplet color
  subCircles: DropletSubCircle[];
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution; // Canvas size in physical pixels
uniform sampler2D u_image;
uniform vec2 u_imageResolution;
uniform sampler2D u_textMask;
uniform int u_hasTextMask;
uniform float u_time;
uniform vec2 u_shadowOffset; // (x, y) in device pixels with flipped y
uniform vec4 u_shadowColor;
uniform vec3 u_invertColor;
uniform int u_isDark;
uniform vec3 u_headDot; // (x, y, radius) in device pixels, flipped y

// Trail metaballs: up to 128 points
uniform vec3 u_trail[128]; // (x, y, radius)
uniform int u_trailCount;

// Droplets: up to 48 sub-circles
uniform vec4 u_droplets[48]; // (x, y, radius, uvSeed)
uniform int u_dropletCount;

// Simple 2D procedural noise for organic paper-cut / amoeba edge
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Metaball density calculation at a sample point
float evaluateDensity(vec2 p) {
  float f = 0.0;

  // 1. Trail points
  for (int i = 0; i < 128; i++) {
    if (i >= u_trailCount) break;
    vec3 pt = u_trail[i];
    float r = pt.z;
    if (r <= 0.001) continue;

    float R = r * 1.8;
    vec2 d = p - pt.xy;
    float distSq = dot(d, d);
    float Rsq = R * R;

    if (distSq < Rsq) {
      float q = distSq / Rsq;
      float k = 1.0 - q;
      f += k * k * k;
    }
  }

  // 2. Droplets
  for (int j = 0; j < 48; j++) {
    if (j >= u_dropletCount) break;
    vec4 dp = u_droplets[j];
    float r = dp.z;
    if (r <= 0.001) continue;

    float R = r * 1.8;
    vec2 d = p - dp.xy;
    float distSq = dot(d, d);
    float Rsq = R * R;

    if (distSq < Rsq) {
      float q = distSq / Rsq;
      float k = 1.0 - q;
      f += k * k * k;
    }
  }

  // Low-frequency animated organic edge noise
  if (f > 0.05) {
    float n = noise(p * 0.014 + u_time * 0.35);
    f += (n - 0.5) * 0.08;
  }

  return f;
}

void main() {
  vec2 p = gl_FragCoord.xy; // Device coordinates, y=0 at bottom

  // 1. Evaluate field at main position
  float f = evaluateDensity(p);

  // 2. Evaluate field at shadow offset position (offset bottom-right)
  vec2 pShadow = p - u_shadowOffset;
  float fShadow = evaluateDensity(pShadow);

  float T = 0.25;

  // Mask for blob
  float m = smoothstep(T - 0.03, T + 0.03, f);

  // Mask for soft drop shadow
  float mShadow = smoothstep(T - 0.07, T + 0.07, fShadow);

  // Head dot (tiny 6px marker at spring cursor)
  float headDotDist = length(p - u_headDot.xy);
  float headDotMask = 0.0;
  if (u_headDot.z > 0.5) {
    headDotMask = smoothstep(u_headDot.z + 0.8, u_headDot.z - 0.8, headDotDist);
  }

  // Early out if nothing to render
  if (m <= 0.0001 && mShadow <= 0.0001 && headDotMask <= 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Smoke image with cover mapping and slow drift
  vec2 canvasRes = u_resolution;
  vec2 imgRes = u_imageResolution;
  if (imgRes.x <= 1.0 || imgRes.y <= 1.0) {
    imgRes = vec2(1920.0, 1080.0);
  }

  float scale = max(canvasRes.x / imgRes.x, canvasRes.y / imgRes.y) * 1.14;
  vec2 scaledSize = imgRes * scale;
  vec2 drift = vec2(sin(u_time * 0.32), cos(u_time * 0.26)) * 0.02 * canvasRes;
  vec2 origin = (canvasRes - scaledSize) * 0.5 + drift;
  vec2 texCoord = (p - origin) / scaledSize;

  vec4 smokeColor = texture2D(u_image, clamp(texCoord, 0.0, 1.0));

  // Vibrant procedural fallback if smoke texture is not yet loaded
  if (smokeColor.a < 0.05) {
    vec3 col = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.05, 0.55), v_uv.x);
    col = mix(col, vec3(1.0, 0.65, 0.0), v_uv.y);
    smokeColor = vec4(col, 1.0);
  }

  // Droplet individual color variation
  // Droplet points have individual seeds that tint or shift droplet colors
  for (int k = 0; k < 48; k++) {
    if (k >= u_dropletCount) break;
    vec4 dp = u_droplets[k];
    float dDist = length(p - dp.xy);
    if (dDist < dp.z * 1.6) {
      // Sample smoke at droplet's individual offset
      vec2 dropTexCoord = clamp(texCoord + vec2(sin(dp.w * 6.28), cos(dp.w * 6.28)) * 0.22, 0.0, 1.0);
      vec4 dropSmoke = texture2D(u_image, dropTexCoord);
      if (dropSmoke.a >= 0.05) {
        float blend = smoothstep(dp.z * 1.6, 0.0, dDist);
        smokeColor.rgb = mix(smokeColor.rgb, dropSmoke.rgb, blend);
      }
    }
  }

  // Inside blob adjustments: inner shade & thin bright rim
  vec3 insideColor = smokeColor.rgb;
  insideColor *= (0.92 + 0.22 * smoothstep(T, T + 0.6, f));

  float diff = f - T;
  float rim = exp(-(diff * diff) / (2.0 * 0.015 * 0.015)) * 0.22;
  vec3 rimColor = u_isDark == 1 ? vec3(0.65, 0.78, 1.0) : vec3(0.9, 0.95, 1.0);
  insideColor += rimColor * rim;

  // Text Inversion: Read text mask texture at current screen coordinate
  // When text is under the blob, invert text color to pure white (light mode) or #0b0d12 (dark mode)
  if (u_hasTextMask == 1) {
    vec2 textUV = vec2(v_uv.x, 1.0 - v_uv.y);
    vec4 textSample = texture2D(u_textMask, textUV);
    float textMask = textSample.a;
    if (textMask > 0.1) {
      // Invert color inside the blob where DOM text exists
      insideColor = mix(insideColor, u_invertColor, textMask * 0.96);
    }
  }

  // Head dot color
  if (headDotMask > 0.0) {
    vec3 headColor = u_isDark == 1 ? vec3(0.1, 0.7, 1.0) : vec3(0.95, 0.7, 0.0);
    insideColor = mix(insideColor, headColor, headDotMask * 0.9);
  }

  // Shadow calculation (drawn behind blob)
  float shadowAlpha = mShadow * (1.0 - m) * u_shadowColor.a;
  vec3 shadowRgb = u_shadowColor.rgb;

  // Composite: Shadow behind, Blob on top (premultiplied alpha)
  vec3 finalRgb = shadowRgb * shadowAlpha + insideColor * m;
  float finalAlpha = clamp(shadowAlpha + m, 0.0, 1.0);

  gl_FragColor = vec4(finalRgb, finalAlpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Catmull-Rom spline interpolation between 4 points
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function initLiquidCursor(options: LiquidCursorOptions): () => void {
  const { canvas, imageUrl = IMAGE_URL, invertSelector = "[data-liquid-invert]" } = options;

  let gl: WebGLRenderingContext | null = null;
  try {
    gl =
      canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
      }) ||
      canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
      });
  } catch {
    gl = null;
  }

  if (!gl) {
    return () => {};
  }

  const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
  if (!program) return () => {};

  gl.useProgram(program);

  // Quad geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const aPos = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uRes = gl.getUniformLocation(program, "u_resolution");
  const uImgRes = gl.getUniformLocation(program, "u_imageResolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uShadowOffset = gl.getUniformLocation(program, "u_shadowOffset");
  const uShadowColor = gl.getUniformLocation(program, "u_shadowColor");
  const uInvertColor = gl.getUniformLocation(program, "u_invertColor");
  const uIsDark = gl.getUniformLocation(program, "u_isDark");
  const uHeadDot = gl.getUniformLocation(program, "u_headDot");
  const uTrail = gl.getUniformLocation(program, "u_trail");
  const uTrailCount = gl.getUniformLocation(program, "u_trailCount");
  const uDroplets = gl.getUniformLocation(program, "u_droplets");
  const uDropletCount = gl.getUniformLocation(program, "u_dropletCount");
  const uImage = gl.getUniformLocation(program, "u_image");
  const uTextMask = gl.getUniformLocation(program, "u_textMask");
  const uHasTextMask = gl.getUniformLocation(program, "u_hasTextMask");

  // Smoke texture
  const smokeTex = gl.createTexture();
  let imgWidth = 1920;
  let imgHeight = 1080;

  const smokeImg = new Image();
  smokeImg.crossOrigin = "anonymous";
  smokeImg.src = imageUrl;

  const uploadSmoke = () => {
    if (!gl || !smokeTex) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, smokeTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, smokeImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    imgWidth = smokeImg.naturalWidth || 1920;
    imgHeight = smokeImg.naturalHeight || 1080;
  };

  if (smokeImg.complete && smokeImg.naturalWidth > 0) uploadSmoke();
  else smokeImg.onload = uploadSmoke;

  // Text mask offscreen canvas & texture
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d", { willReadFrequently: true });
  const textTex = gl.createTexture();
  let hasTextMask = false;

  const rasterizeTextMask = () => {
    if (!textCtx || !gl || !textTex) return;
    const targets = document.querySelectorAll(invertSelector);
    if (targets.length === 0) {
      hasTextMask = false;
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    textCanvas.width = Math.round(w * dpr);
    textCanvas.height = Math.round(h * dpr);
    textCtx.setTransform(1, 0, 0, 1, 0, 0);
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    textCtx.scale(dpr, dpr);

    targets.forEach((elem) => {
      const rect = elem.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > h || rect.right < 0 || rect.left > w) return;

      const style = window.getComputedStyle(elem);
      textCtx.save();
      textCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      textCtx.fillStyle = "#ffffff";
      textCtx.textBaseline = "top";

      // If textContent has multiple child nodes or lines, draw text according to client rects
      const text = elem.textContent || "";
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      if (lines.length > 0) {
        let currY = rect.top;
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.15;
        for (const line of lines) {
          textCtx.fillText(line, rect.left, currY);
          currY += lineHeight;
        }
      }
      textCtx.restore();
    });

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    hasTextMask = true;
  };

  // Text mask observers
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(rasterizeTextMask).catch(() => {});
  }
  const domObserver = new MutationObserver(() => {
    rasterizeTextMask();
  });
  domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Spring physics for glass-smooth cursor tracking
  let pointerTargetX = -10000;
  let pointerTargetY = -10000;
  let springX = -10000;
  let springY = -10000;
  let springVx = 0;
  let springVy = 0;
  let hasPointer = false;
  let isInside = false;

  // History buffer for Catmull-Rom spline (last 4 spring positions)
  const headHistory: { x: number; y: number }[] = [];

  // Speed and smoothed radius
  let lastSpeedCheckTime = performance.now();
  let lastHeadX = -10000;
  let lastHeadY = -10000;
  let currentSpeed = 0;
  let smoothedRadius = 22;

  // Particle buffers
  const trail: TrailPoint[] = [];
  const droplets: Droplet[] = [];
  let lastDropletTime = 0;

  // Pre-allocated uniform arrays
  const trailUniformData = new Float32Array(128 * 3);
  const dropletUniformData = new Float32Array(48 * 4);

  let dpr = 1;
  let cssW = 0;
  let cssH = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;

    const physW = Math.round(cssW * dpr);
    const physH = Math.round(cssH * dpr);

    if (canvas.width !== physW || canvas.height !== physH) {
      canvas.width = physW;
      canvas.height = physH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    }
    if (gl) gl.viewport(0, 0, physW, physH);
    rasterizeTextMask();
  };

  resize();
  window.addEventListener("resize", resize);

  // Pointer listeners
  const onPointerMove = (e: PointerEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    if (!hasPointer) {
      hasPointer = true;
      springX = x;
      springY = y;
      pointerTargetX = x;
      pointerTargetY = y;
      lastHeadX = x;
      lastHeadY = y;
      headHistory.length = 0;
      headHistory.push({ x, y }, { x, y }, { x, y }, { x, y });
    } else {
      pointerTargetX = x;
      pointerTargetY = y;
    }
    isInside = true;
  };

  const onPointerLeave = () => {
    isInside = false;
  };

  const onWindowBlur = () => {
    isInside = false;
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.addEventListener("mouseleave", onPointerLeave);
  window.addEventListener("blur", onWindowBlur);

  let animId = 0;
  let isDisposed = false;
  let lastTime = performance.now();
  const startTime = performance.now();
  let wasCleared = false;

  const tick = (now: number) => {
    if (isDisposed || !gl) return;

    let dt = (now - lastTime) * 0.001;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;
    if (dt <= 0) dt = 0.016;

    const elapsed = (now - startTime) * 0.001;

    // Check theme
    const isDark = document.documentElement.classList.contains("dark");

    // 1. Critically damped spring simulation for glass-smooth pointer follow
    if (hasPointer && isInside) {
      const springK = 380; // Stiffness
      const springDamping = 2 * Math.sqrt(springK) * 0.98; // Critical damping factor

      const ax = (pointerTargetX - springX) * springK - springVx * springDamping;
      const ay = (pointerTargetY - springY) * springK - springVy * springDamping;

      springVx += ax * dt;
      springVy += ay * dt;
      springX += springVx * dt;
      springY += springVy * dt;

      // Update speed
      const dtSpeed = (now - lastSpeedCheckTime) * 0.001;
      if (dtSpeed > 0.01) {
        const moveDist = Math.hypot(springX - lastHeadX, springY - lastHeadY);
        const instantSpeed = moveDist / dtSpeed;
        currentSpeed = currentSpeed * 0.7 + instantSpeed * 0.3;
        lastHeadX = springX;
        lastHeadY = springY;
        lastSpeedCheckTime = now;
      }
    } else {
      currentSpeed *= Math.exp(-dt * 4.0);
    }

    // 2. Smoothed radius = clamp(10 + speed * 0.022, 10, 56)
    const targetRadius = Math.min(Math.max(10 + currentSpeed * 0.022, 10), 56);
    smoothedRadius += (targetRadius - smoothedRadius) * 0.22;

    // 3. Catmull-Rom trail interpolation
    if (hasPointer && isInside) {
      headHistory.push({ x: springX, y: springY });
      if (headHistory.length > 4) headHistory.shift();

      if (headHistory.length === 4) {
        const p0 = headHistory[0]!;
        const p1 = headHistory[1]!;
        const p2 = headHistory[2]!;
        const p3 = headHistory[3]!;

        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const spacing = Math.max(4, smoothedRadius * 0.5);

        if (segDist >= spacing) {
          const steps = Math.max(1, Math.min(Math.ceil(segDist / spacing), 8));
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const px = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
            const py = catmullRom(p0.y, p1.y, p2.y, p3.y, t);

            if (trail.length >= 128) trail.shift();
            trail.push({
              x: px,
              y: py,
              radius: smoothedRadius,
              birth: now,
              lifetime: 600,
            });

            // Shed pebble droplets from trail (every 90-140ms when speed > 200)
            if (
              currentSpeed > 200 &&
              now - lastDropletTime > 110 &&
              droplets.length < 24 &&
              Math.random() < 0.35
            ) {
              lastDropletTime = now;
              const moveAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
              const perpAngle = moveAngle + (Math.random() < 0.5 ? Math.PI * 0.5 : -Math.PI * 0.5);
              const dropSpeed = 80 + Math.random() * 160;

              // Generate 2 or 3 irregular sub-circles
              const subCount = 2 + Math.floor(Math.random() * 2);
              const subCircles: DropletSubCircle[] = [];
              for (let sc = 0; sc < subCount; sc++) {
                subCircles.push({
                  ox: (Math.random() - 0.5) * 4,
                  oy: (Math.random() - 0.5) * 4,
                  rScale: 0.65 + Math.random() * 0.35,
                });
              }

              droplets.push({
                x: px,
                y: py,
                vx: Math.cos(perpAngle) * dropSpeed,
                vy: Math.sin(perpAngle) * dropSpeed,
                baseRadius: 5 + Math.random() * 10,
                birth: now,
                lifetime: 1200 + Math.random() * 1400,
                uvOffset: [Math.random(), Math.random()],
                subCircles,
              });
            }
          }
        }
      }
    }

    // 4. Update and cull trail points: s = (1 - age)^1.3
    const liveTrail: { x: number; y: number; r: number }[] = [];
    for (let i = trail.length - 1; i >= 0; i--) {
      const pt = trail[i]!;
      const age = (now - pt.birth) / pt.lifetime;
      if (age >= 1.0) {
        trail.splice(i, 1);
        continue;
      }
      const scale = Math.pow(Math.max(0, 1.0 - age), 1.3);
      const r = pt.radius * scale;
      if (r > 0.4) {
        liveTrail.push({ x: pt.x, y: pt.y, r });
      }
    }

    // 5. Update and cull droplets
    const liveDroplets: { x: number; y: number; r: number; seed: number }[] = [];
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i]!;
      const age = (now - d.birth) / d.lifetime;
      if (age >= 1.0) {
        droplets.splice(i, 1);
        continue;
      }
      // Velocity friction: exp(-dt * 2.5)
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      const fric = Math.exp(-dt * 2.5);
      d.vx *= fric;
      d.vy *= fric;

      // Shrink only in the last 40% of life
      let scale = 1.0;
      if (age > 0.6) {
        scale = Math.max(0, (1.0 - age) / 0.4);
      }
      const r = d.baseRadius * scale;
      if (r > 0.4) {
        // Add sub-circles for irregular droplet pebble shape
        for (const sc of d.subCircles) {
          liveDroplets.push({
            x: d.x + sc.ox * scale,
            y: d.y + sc.oy * scale,
            r: r * sc.rScale,
            seed: d.uvOffset[0],
          });
        }
      }
    }

    // 6. Zero live points check: clear once and pause rendering
    if (liveTrail.length === 0 && liveDroplets.length === 0) {
      if (!wasCleared) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        wasCleared = true;
      }
      animId = requestAnimationFrame(tick);
      return;
    }

    wasCleared = false;

    // 7. Pack trail points into u_trail uniform
    const trailCount = Math.min(liveTrail.length, 128);
    for (let i = 0; i < trailCount; i++) {
      const p = liveTrail[i]!;
      const idx = i * 3;
      trailUniformData[idx] = p.x * dpr;
      trailUniformData[idx + 1] = (cssH - p.y) * dpr;
      trailUniformData[idx + 2] = p.r * dpr;
    }

    // Pack droplet points into u_droplets uniform
    const dropCount = Math.min(liveDroplets.length, 48);
    for (let j = 0; j < dropCount; j++) {
      const dp = liveDroplets[j]!;
      const jdx = j * 4;
      dropletUniformData[jdx] = dp.x * dpr;
      dropletUniformData[jdx + 1] = (cssH - dp.y) * dpr;
      dropletUniformData[jdx + 2] = dp.r * dpr;
      dropletUniformData[jdx + 3] = dp.seed;
    }

    // 8. Render full-screen WebGL quad
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uImgRes, imgWidth, imgHeight);
    gl.uniform1f(uTime, elapsed);

    // Shadow offset ~ 10px right, 14px down (flipped y in GL is -14)
    gl.uniform2f(uShadowOffset, 10.0 * dpr, -14.0 * dpr);

    // Theme-dependent colors
    if (isDark) {
      gl.uniform4f(uShadowColor, 0.0, 0.0, 0.0, 0.55);
      gl.uniform3f(uInvertColor, 0.043, 0.051, 0.071); // #0b0d12
      gl.uniform1i(uIsDark, 1);
    } else {
      gl.uniform4f(uShadowColor, 90 / 255, 90 / 255, 110 / 255, 0.28);
      gl.uniform3f(uInvertColor, 1.0, 1.0, 1.0); // pure white
      gl.uniform1i(uIsDark, 0);
    }

    // Tiny head dot (6px) at spring cursor position
    if (hasPointer && isInside && liveTrail.length > 0) {
      gl.uniform3f(uHeadDot, springX * dpr, (cssH - springY) * dpr, 3.0 * dpr);
    } else {
      gl.uniform3f(uHeadDot, 0, 0, 0);
    }

    gl.uniform3fv(uTrail, trailUniformData);
    gl.uniform1i(uTrailCount, trailCount);

    gl.uniform4fv(uDroplets, dropletUniformData);
    gl.uniform1i(uDropletCount, dropCount);

    // Text mask uniform
    gl.uniform1i(uHasTextMask, hasTextMask ? 1 : 0);

    // Bind textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, smokeTex);
    gl.uniform1i(uImage, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.uniform1i(uTextMask, 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animId = requestAnimationFrame(tick);
  };

  animId = requestAnimationFrame(tick);

  // Return complete teardown function
  return () => {
    isDisposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    document.removeEventListener("mouseleave", onPointerLeave);
    window.removeEventListener("blur", onWindowBlur);
    domObserver.disconnect();

    if (gl) {
      if (smokeTex) gl.deleteTexture(smokeTex);
      if (textTex) gl.deleteTexture(textTex);
      if (posBuffer) gl.deleteBuffer(posBuffer);
      if (program) gl.deleteProgram(program);
    }
  };
}
