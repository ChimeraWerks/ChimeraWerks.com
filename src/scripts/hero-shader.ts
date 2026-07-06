/**
 * Page-wide smoke atmosphere: slow domain-warped simplex-fbm "smoke" rendered
 * with OGL onto a position:fixed canvas pinned behind the entire page
 * (z-index -10 — in front of the body background, behind all content), so the
 * atmosphere runs seamlessly under every section with no break at the hero
 * fold. Theme-aware: colors are read once at init from the --bg / --accent /
 * --accent-2 tokens on <html data-theme>, so the same program renders
 * iris+amber on the arcane slice and violet+cyan on the precision slice.
 *
 * Scroll-linked intensity: full smoke strength over the hero viewport, easing
 * down to a dim floor after one viewport of scroll so content sections stay
 * readable over the haze (see INTENSITY_FLOOR).
 *
 * Fallback contract: reduced-motion, missing WebGL, and context loss remove
 * the canvas and leave the page's CSS backgrounds untouched. Page mode never
 * relocates into #hero-canvas-slot and never touches that slot's children —
 * an optional 3D hero canvas simply layers above this atmosphere.
 */
import { Mesh, Program, Renderer, Triangle } from "ogl";

type Vec3 = [number, number, number];

const DPR_CAP = 1.5;
const FADE_CLASS = "is-live";

/* Post-hero strength: content sections sit over smoke at this fraction of
   hero strength. Kept at the dark end of the 0.35-0.45 band so the shader's
   tone ceiling keeps parchment text at 4.5:1 everywhere below the fold. */
const INTENSITY_FLOOR = 0.38;

/* One fixed canvas per page. The component can be dropped in several places
   (or the script can re-run); only the first canvas mounts, the rest remove
   themselves. Without this guard two opaque fullscreen contexts would fight. */
const MOUNT_FLAG = "data-hero-shader-mounted";

/* Arcane-theme values; only used if a token is missing or unparseable. */
const FALLBACK: Record<"bg" | "accent" | "accent2", Vec3> = {
  bg: [0.039, 0.035, 0.031],
  accent: [0.655, 0.545, 0.941],
  accent2: [0.878, 0.635, 0.227],
};

const VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/*
 * Ashima/webgl-noise simplex 3D (public domain-style MIT), 4-octave fbm,
 * one level of domain warping (iq's f(p + fbm(p)) construction) with time on
 * the z axis so the smoke evolves instead of scrolling.
 */
const FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform float uTime;
uniform float uIntensity; /* scroll-linked: 1.0 at hero, INTENSITY_FLOOR below */
uniform vec2 uResolution;
uniform vec2 uParallax;
uniform vec3 uBg;
uniform vec3 uAccentA; /* --accent:   anchored low-left  */
uniform vec3 uAccentB; /* --accent-2: anchored high-right */

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    f += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return f;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 1.7 + uParallax;

  float t = uTime * 0.05;

  vec2 warp = vec2(
    fbm(vec3(p + vec2(0.0, 3.7), t)),
    fbm(vec3(p + vec2(5.2, 1.3), t * 0.85))
  );
  float n = fbm(vec3(p + warp * 1.35, t * 0.6)) * 0.5 + 0.5;

  /* Complementary densities so the two fields interleave instead of stack. */
  float sA = smoothstep(0.34, 0.92, n);
  float sB = smoothstep(0.42, 0.96, 1.0 - n);

  /* Spatial anchors echoing the site vignette: accent low-left, accent-2
     high-right (uv origin is bottom-left on the fullscreen triangle). */
  vec2 q = vUv * vec2(aspect, 1.0);
  float dA = distance(q, vec2(aspect * 0.16, 0.16));
  float dB = distance(q, vec2(aspect * 0.86, 0.84));
  float wA = exp(-1.9 * dA * dA);
  float wB = exp(-1.6 * dB * dB);

  /* uIntensity scales both accent fields AND the haze so scrolling dims the
     whole atmosphere uniformly instead of leaving a bright midfield. */
  vec3 col = uBg;
  col += uAccentA * (sA * wA * 0.20 * uIntensity);
  col += uAccentB * (sB * wB * 0.17 * uIntensity);
  /* Faint cross-fading haze so the midfield is not dead black. */
  col += mix(uAccentA, uAccentB, vUv.x) * (n * 0.03 * uIntensity);

  /* Soft ceiling: keeps peak luminance low so parchment/white display text
     above never loses contrast. */
  col = col / (1.0 + max(max(col.r, col.g), col.b) * 0.35);

  /* Ordered-ish dither to break banding in the near-black gradients. */
  float dn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dn - 0.5) * (1.5 / 255.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function parseCssColor(raw: string): Vec3 | null {
  const s = raw.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
  if (hex && hex[1]) {
    const h = hex[1];
    const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255,
    ];
  }
  const fn = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(s);
  if (fn && fn[1] && fn[2] && fn[3]) {
    const clamp = (v: number) => Math.min(Math.max(v / 255, 0), 1);
    return [clamp(Number(fn[1])), clamp(Number(fn[2])), clamp(Number(fn[3]))];
  }
  return null;
}

function readThemeColor(styles: CSSStyleDeclaration, token: string, fallback: Vec3): Vec3 {
  return parseCssColor(styles.getPropertyValue(token)) ?? fallback;
}

/**
 * Entry point. Checks reduced-motion and the single-mount guard immediately,
 * then defers the WebGL init until the browser is idle so it never competes
 * with first paint.
 */
export function mountHeroShader(canvas: HTMLCanvasElement): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.remove();
    return;
  }
  if (document.documentElement.hasAttribute(MOUNT_FLAG)) {
    canvas.remove();
    return;
  }
  document.documentElement.setAttribute(MOUNT_FLAG, "");
  // Init strictly after the load event: shader compilation on a throttled CPU
  // otherwise lands inside the hero headline's paint window and measurably
  // delays LCP (observed 148ms -> 1317ms under Lighthouse's Moto G emulation).
  // The atmosphere is ambience; arriving a beat after the text is the design.
  const start = () => initHeroShader(canvas);
  const idle = () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(start, { timeout: 2000 });
    } else {
      setTimeout(start, 300);
    }
  };
  if (document.readyState === "complete") {
    idle();
  } else {
    window.addEventListener("load", idle, { once: true });
  }
}

function initHeroShader(canvas: HTMLCanvasElement): void {
  /* Probe the context ourselves: OGL's Renderer console.errors and throws on
     a null context. getContext is idempotent per type, so OGL reuses this
     exact context (and these attributes) when it constructs. */
  const attrs: WebGLContextAttributes = {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    powerPreference: "low-power",
  };
  const probe = canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs);
  if (!probe) {
    console.debug("hero-shader: WebGL unavailable, keeping CSS background");
    canvas.remove();
    return;
  }

  let renderer: Renderer;
  let mesh: Mesh;
  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uResolution: { value: new Float32Array([1, 1]) },
    uParallax: { value: new Float32Array([0, 0]) },
    uBg: { value: new Float32Array(3) },
    uAccentA: { value: new Float32Array(3) },
    uAccentB: { value: new Float32Array(3) },
  };

  try {
    renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP),
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "low-power",
    });
    const gl = renderer.gl;

    const styles = getComputedStyle(document.documentElement);
    uniforms.uBg.value.set(readThemeColor(styles, "--bg", FALLBACK.bg));
    uniforms.uAccentA.value.set(readThemeColor(styles, "--accent", FALLBACK.accent));
    uniforms.uAccentB.value.set(readThemeColor(styles, "--accent-2", FALLBACK.accent2));

    const program = new Program(gl, { vertex: VERTEX, fragment: FRAGMENT, uniforms });
    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  } catch {
    console.debug("hero-shader: WebGL init failed, keeping CSS background");
    canvas.remove();
    return;
  }
  const gl = renderer.gl;

  /* Page mode: re-parent to <body> so the fixed, negative-z canvas sits in
     the root stacking context. Left inside a transformed/filtered ancestor it
     would be trapped above (or clipped by) that ancestor's content. */
  document.body.appendChild(canvas);

  /* The canvas is fixed to the viewport, so size from the window — no slot,
     no ResizeObserver. */
  const resize = () => {
    renderer.setSize(window.innerWidth || 1, window.innerHeight || 1);
    uniforms.uResolution.value[0] = gl.drawingBufferWidth;
    uniforms.uResolution.value[1] = gl.drawingBufferHeight;
    onScroll(); /* one viewport of scroll just changed length */
  };

  /* Scroll-linked intensity: smoothstep from 1.0 at the top of the page down
     to INTENSITY_FLOOR after one viewport of scroll. Only scrollY (plus the
     cached-cheap innerHeight) is read, and only inside the passive listener —
     the frame loop does no layout reads, it just eases toward the target. */
  let intensityTarget = 1;
  const onScroll = () => {
    const p = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight, 1), 0), 1);
    const eased = p * p * (3 - 2 * p);
    intensityTarget = 1 - eased * (1 - INTENSITY_FLOOR);
  };
  onScroll();
  uniforms.uIntensity.value = intensityTarget; /* no flash if loaded mid-page */
  resize();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });

  /* Very subtle pointer parallax: eased in the frame loop, never re-renders
     on its own, and cheap enough to leave always-on. */
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 0.06;
    target.y = (0.5 - e.clientY / window.innerHeight) * 0.06;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let raf = 0;
  let running = false;
  let last = 0;
  let elapsed = 0;
  let firstFrame = true;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    elapsed += dt;

    eased.x += (target.x - eased.x) * 0.04;
    eased.y += (target.y - eased.y) * 0.04;
    uniforms.uParallax.value[0] = eased.x;
    uniforms.uParallax.value[1] = eased.y;
    uniforms.uTime.value = elapsed;
    uniforms.uIntensity.value += (intensityTarget - uniforms.uIntensity.value) * 0.08;

    renderer.render({ scene: mesh });

    if (firstFrame) {
      firstFrame = false;
      /* Fade in only after the first frame has actually painted. */
      requestAnimationFrame(() => canvas.classList.add(FADE_CLASS));
    }
  };

  /* A fixed full-page canvas is always "in view", so IntersectionObserver is
     meaningless here — pause purely on tab visibility. */
  const syncLoop = () => {
    const shouldRun = !document.hidden;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };
  document.addEventListener("visibilitychange", syncLoop);
  syncLoop();

  /* On context loss, hand the page back to the CSS backgrounds for good. */
  canvas.addEventListener(
    "webglcontextlost",
    () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncLoop);
      canvas.remove();
    },
    { once: true },
  );
}
