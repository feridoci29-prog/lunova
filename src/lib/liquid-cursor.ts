/**
 * ============================================================================
 * LIQUID CURSOR REVEAL EFFECT (WebGL Metaball Shader Engine)
 * ============================================================================
 * High-performance WebGL-based liquid reveal engine.
 * Renders a crisp metaball liquid blob that follows the pointer via exponential
 * smoothing, using a single full-screen fragment shader to composite the smoke
 * image with object-fit: cover, parallax drift, specular edge rim, and subtle
 * ambient glow.
 *
 * Designed to cleanly handle resize, devicePixelRatio, idle fade-out,
 * window blur/leave, and React StrictMode double-mounting.
 */

// ============================================================================
// TWEAKABLE CONSTANTS (Preserved interface for backwards compatibility)
// ============================================================================
export const BLUR = 16;
export const TRAIL_LIFETIME = 560; // ms per point
export const BLOB_RADIUS = 50; // Max base radius
export const DROPLET_CHANCE = 0.3; // 30% chance when moving fast (> 350 px/s)
export const EASING = 0.15;
export const IMAGE_URL = "/assets/smoke.jpg";
export const IDLE_TIMEOUT = 600; // ms
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
}

interface Point {
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

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution; // Canvas size in physical pixels
uniform sampler2D u_image;
uniform vec2 u_imageResolution;
uniform float u_time;
uniform vec3 u_points[80]; // (x, y, radius) in device pixels with flipped y
uniform int u_pointCount;

void main() {
  // Current fragment coord in device pixels (gl_FragCoord.xy has y=0 at bottom)
  vec2 p = gl_FragCoord.xy;

  // 1. Metaball density field with compact cubic kernel
  float f = 0.0;
  for (int i = 0; i < 80; i++) {
    if (i >= u_pointCount) break;
    vec3 pt = u_points[i];
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

  // 2. Thresholding and mask calculation
  float T = 0.25;
  float m = smoothstep(T - 0.035, T + 0.035, f);

  // If outside and no subtle glow, discard early
  if (f <= 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // 3. Smoke texture with object-fit: cover math and parallax drift
  vec2 canvasRes = u_resolution;
  vec2 imgRes = u_imageResolution;
  if (imgRes.x <= 1.0 || imgRes.y <= 1.0) {
    imgRes = vec2(1920.0, 1080.0);
  }

  float scale = max(canvasRes.x / imgRes.x, canvasRes.y / imgRes.y) * 1.14;
  vec2 scaledSize = imgRes * scale;

  // Drift offset (sin/cos * 0.02)
  vec2 drift = vec2(sin(u_time * 0.35), cos(u_time * 0.28)) * 0.02 * canvasRes;
  vec2 origin = (canvasRes - scaledSize) * 0.5 + drift;
  vec2 texCoord = (p - origin) / scaledSize;

  // Clamped texture sampling
  vec4 texColor = texture2D(u_image, clamp(texCoord, 0.0, 1.0));

  // Fallback vibrant gradient if texture is empty/transparent
  if (texColor.a < 0.05) {
    vec3 grad = mix(vec3(0.0, 0.53, 1.0), vec3(1.0, 0.0, 0.5), v_uv.x);
    grad = mix(grad, vec3(1.0, 0.67, 0.0), v_uv.y);
    texColor = vec4(grad, 1.0);
  }

  // 4. Inside the blob adjustments: core highlight & specular light rim
  vec3 insideColor = texColor.rgb;
  insideColor *= (0.92 + 0.22 * smoothstep(T, T + 0.6, f));

  // Gaussian rim around f = T
  float diff = f - T;
  float rim = exp(- (diff * diff) / (2.0 * 0.015 * 0.015)) * 0.16;
  vec3 rimColor = vec3(0.5, 0.6, 1.0);
  insideColor += rimColor * rim;

  // 5. Outside the blob: subtle ambient blue glow
  float glowAlpha = pow(smoothstep(0.0, T, f), 2.0) * 0.22;
  vec3 glowColor = vec3(0.05, 0.18, 0.45);

  // 6. Combine inside (m) and outside (1.0 - m)
  vec3 finalRgb = mix(glowColor * glowAlpha, insideColor, m);
  float finalAlpha = mix(glowAlpha, 1.0, m);

  // Output premultiplied alpha
  gl_FragColor = vec4(finalRgb * finalAlpha, finalAlpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
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
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Initializes the liquid cursor reveal effect on the given canvas element.
 * Uses WebGL full-screen fragment shader for fluid 60fps metaball compositing.
 */
export function initLiquidCursor(options: LiquidCursorOptions): () => void {
  const { canvas, imageUrl = IMAGE_URL } = options;

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
  } catch {
    gl = null;
  }

  if (!gl) {
    // Fallback: WebGL not supported
    return () => {};
  }

  const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  if (!program) return () => {};

  gl.useProgram(program);

  // Quad geometry (-1 to 1)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPositionLocation);
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const uImageResolutionLocation = gl.getUniformLocation(program, "u_imageResolution");
  const uTimeLocation = gl.getUniformLocation(program, "u_time");
  const uPointsLocation = gl.getUniformLocation(program, "u_points");
  const uPointCountLocation = gl.getUniformLocation(program, "u_pointCount");
  const uImageLocation = gl.getUniformLocation(program, "u_image");

  // Load texture
  const texture = gl.createTexture();
  let imageWidth = 1920;
  let imageHeight = 1080;

  const smokeImage = new Image();
  smokeImage.crossOrigin = "anonymous";
  smokeImage.src = imageUrl;

  const uploadTexture = () => {
    if (!gl || !texture) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, smokeImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    imageWidth = smokeImage.naturalWidth || 1920;
    imageHeight = smokeImage.naturalHeight || 1080;
  };

  if (smokeImage.complete && smokeImage.naturalWidth > 0) {
    uploadTexture();
  } else {
    smokeImage.onload = () => {
      uploadTexture();
    };
  }

  // Pre-allocated Float32Array for 80 points * 3 floats (x, y, radius)
  const pointsUniformData = new Float32Array(80 * 3);

  // Pointer state & follow
  let rawPointerX = -10000;
  let rawPointerY = -10000;
  let hasPointer = false;
  let isInside = false;

  // Exponential follow position
  let smoothX = -10000;
  let smoothY = -10000;
  let lastSpawnX = -10000;
  let lastSpawnY = -10000;

  // Speed and smoothed radius
  let lastRawX = -10000;
  let lastRawY = -10000;
  let lastRawTime = 0;
  let currentSpeed = 0; // px/s
  let smoothedRadius = 18;

  // Particle arrays
  const trail: Point[] = [];
  const droplets: Droplet[] = [];

  let dpr = 1;
  let cssWidth = 0;
  let cssHeight = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    const physicalWidth = Math.round(cssWidth * dpr);
    const physicalHeight = Math.round(cssHeight * dpr);

    if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
      canvas.width = physicalWidth;
      canvas.height = physicalHeight;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }
    if (gl) {
      gl.viewport(0, 0, physicalWidth, physicalHeight);
    }
  };

  resize();
  window.addEventListener("resize", resize);

  // Pointer listeners on window
  const onPointerMove = (e: PointerEvent) => {
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;

    if (!hasPointer) {
      hasPointer = true;
      smoothX = x;
      smoothY = y;
      lastSpawnX = x;
      lastSpawnY = y;
      lastRawX = x;
      lastRawY = y;
      lastRawTime = now;
    } else {
      const dtRaw = (now - lastRawTime) * 0.001;
      if (dtRaw > 0.001) {
        const rawDist = Math.hypot(x - lastRawX, y - lastRawY);
        const instantSpeed = rawDist / dtRaw;
        // Damp instant speed
        currentSpeed = currentSpeed * 0.7 + instantSpeed * 0.3;
        lastRawX = x;
        lastRawY = y;
        lastRawTime = now;
      }
    }

    rawPointerX = x;
    rawPointerY = y;
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

  let animationFrameId = 0;
  let isDisposed = false;
  let lastTime = performance.now();
  const startTime = performance.now();
  let wasCleared = false;

  const tick = (now: number) => {
    if (isDisposed || !gl) return;

    let dt = (now - lastTime) * 0.001;
    lastTime = now;
    // Cap dt at 50ms to prevent huge jumps
    if (dt > 0.05) dt = 0.05;
    if (dt <= 0) dt = 0.016;

    const elapsed = (now - startTime) * 0.001;

    // 1. Exponential follow for pointer: k = 1 - exp(-dt * 22)
    if (hasPointer && isInside) {
      const k = 1.0 - Math.exp(-dt * 22.0);
      smoothX += (rawPointerX - smoothX) * k;
      smoothY += (rawPointerY - smoothY) * k;
    }

    // 2. Target radius = clamp(9 + speed * 0.02, 9, 50), smoothed with rS += (target - rS) * 0.25
    const targetRadius = Math.min(Math.max(9 + currentSpeed * 0.02, 9), 50);
    smoothedRadius += (targetRadius - smoothedRadius) * 0.25;

    // Decay currentSpeed over time
    currentSpeed *= Math.exp(-dt * 3.5);

    // 3. Spawning points along move path
    if (hasPointer && isInside) {
      const dist = Math.hypot(smoothX - lastSpawnX, smoothY - lastSpawnY);

      // Add a point only when the pointer actually moved (> 0.6px)
      if (dist > 0.6) {
        const spacing = Math.max(5, smoothedRadius * 0.6);
        const steps = Math.max(1, Math.min(Math.ceil(dist / spacing), 15));

        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const px = lastSpawnX + (smoothX - lastSpawnX) * t;
          const py = lastSpawnY + (smoothY - lastSpawnY) * t;

          // Cap total trail points at ~66
          if (trail.length >= 66) {
            trail.shift();
          }

          trail.push({
            x: px,
            y: py,
            radius: smoothedRadius,
            birth: now,
            lifetime: 560,
          });

          // 4. Satellite droplets: fast move (> 350 px/s) + 30% chance, max 14
          if (currentSpeed > 350 && Math.random() < 0.3 && droplets.length < 14) {
            // Perpendicular direction to movement
            const moveAngle = Math.atan2(smoothY - lastSpawnY, smoothX - lastSpawnX);
            const perpAngle = moveAngle + (Math.random() < 0.5 ? Math.PI * 0.5 : -Math.PI * 0.5);
            const speed = 90 + Math.random() * 200; // 90 to 290 px/s

            droplets.push({
              x: px,
              y: py,
              vx: Math.cos(perpAngle) * speed,
              vy: Math.sin(perpAngle) * speed,
              radius: 3 + Math.random() * 6, // 3 to 9px
              birth: now,
              lifetime: 450 + Math.random() * 350, // 450 to 800ms
            });
          }
        }

        lastSpawnX = smoothX;
        lastSpawnY = smoothY;
      }
    }

    // 5. Update and cull trail points
    // Point shrinks with s = (1 - age)^1.3
    const livePoints: { x: number; y: number; r: number }[] = [];

    for (let i = trail.length - 1; i >= 0; i--) {
      const pt = trail[i]!;
      const age = (now - pt.birth) / pt.lifetime;
      if (age >= 1.0) {
        trail.splice(i, 1);
        continue;
      }
      const scale = Math.pow(Math.max(0, 1.0 - age), 1.3);
      const r = pt.radius * scale;
      if (r > 0.5) {
        livePoints.push({ x: pt.x, y: pt.y, r });
      }
    }

    // 6. Update and cull droplets
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i]!;
      const age = (now - d.birth) / d.lifetime;
      if (age >= 1.0) {
        droplets.splice(i, 1);
        continue;
      }
      // Physics damping
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= Math.pow(0.85, dt * 60);
      d.vy *= Math.pow(0.85, dt * 60);

      const scale = Math.pow(Math.max(0, 1.0 - age), 1.2);
      const r = d.radius * scale;
      if (r > 0.4) {
        livePoints.push({ x: d.x, y: d.y, r });
      }
    }

    // 7. If there are no live points, draw nothing (clear once, then skip)
    if (livePoints.length === 0) {
      if (!wasCleared) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        wasCleared = true;
      }
      animationFrameId = requestAnimationFrame(tick);
      return;
    }

    wasCleared = false;

    // 8. Pack live points into u_points uniform (up to 80)
    const count = Math.min(livePoints.length, 80);

    for (let i = 0; i < count; i++) {
      const p = livePoints[i]!;
      const baseIdx = i * 3;
      // Convert to device coordinates with flipped Y (H - y)
      pointsUniformData[baseIdx] = p.x * dpr;
      pointsUniformData[baseIdx + 1] = (cssHeight - p.y) * dpr;
      pointsUniformData[baseIdx + 2] = p.r * dpr;
    }

    // Render WebGL frame
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(uImageResolutionLocation, imageWidth, imageHeight);
    gl.uniform1f(uTimeLocation, elapsed);
    gl.uniform3fv(uPointsLocation, pointsUniformData);
    gl.uniform1i(uPointCountLocation, count);

    // Bind texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uImageLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameId = requestAnimationFrame(tick);
  };

  animationFrameId = requestAnimationFrame(tick);

  // Return complete teardown function
  return () => {
    isDisposed = true;
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    document.removeEventListener("mouseleave", onPointerLeave);
    window.removeEventListener("blur", onWindowBlur);

    if (gl) {
      if (texture) gl.deleteTexture(texture);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
    }
  };
}
