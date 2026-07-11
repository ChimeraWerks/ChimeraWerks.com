/**
 * WireHero - the hologram-bench cut's signature scene.
 *
 * The wireframe chimera (myth subject) rendered as a live holographic
 * projection (engineering medium): the beast materializes above an emitter
 * ring through a light cone, with render-particles rising into it and a
 * scanline/glitch shader carrying the "projected, not painted" read.
 *
 * Forked from LowPolyHero (same render gates, theme-token colors, additive
 * black-floor keying) but the mark plane is a custom ShaderMaterial: the
 * black-floor subtract moves into the fragment shader, joined by scanlines,
 * a materialization sweep, chromatic drift, and interval glitch bands.
 *
 * Render gates mirror the proven ones: prefers-reduced-motion and no-WebGL
 * render null (the static mark ships via html.facet-3d-off); offscreen or
 * hidden tab pause the frameloop; a WebGL error boundary makes a context
 * failure fall back to the static mark instead of erasing the brand.
 */

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { THEME_CHANGE_EVENT } from "../data/themes";
import wireAsset from "../assets/marks/chimera-wire.webp";

/* Astro's Vite pipeline returns ImageMetadata for image imports; plain Vite
   returns a URL string. Accept either so the component survives both. */
function assetUrl(asset: unknown): string {
  return typeof asset === "string" ? asset : (asset as { src: string }).src;
}
const WIRE_URL: string = assetUrl(wireAsset);

/* --------------------------------------------------------------- theme --- */

interface WireColors {
  bg: THREE.Color;
  violet: THREE.Color;
  indigo: THREE.Color;
  cyan: THREE.Color;
  holo: THREE.Color;
}

const FALLBACKS: Readonly<Record<string, string>> = {
  "--bg": "#0a0b0f",
  "--facet-violet": "#8f7bf0",
  "--facet-indigo": "#6c63f5",
  "--facet-cyan": "#45c6e0",
  "--holo": "#6fd6ec",
};

function cssColor(styles: CSSStyleDeclaration, token: string): THREE.Color {
  const raw = styles.getPropertyValue(token).trim();
  const value = raw !== "" ? raw : (FALLBACKS[token] ?? "#808080");
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(FALLBACKS[token] ?? "#808080");
  }
}

function readColors(): WireColors {
  if (typeof window === "undefined") {
    return {
      bg: new THREE.Color(FALLBACKS["--bg"]),
      violet: new THREE.Color(FALLBACKS["--facet-violet"]),
      indigo: new THREE.Color(FALLBACKS["--facet-indigo"]),
      cyan: new THREE.Color(FALLBACKS["--facet-cyan"]),
      holo: new THREE.Color(FALLBACKS["--holo"]),
    };
  }
  const s = window.getComputedStyle(document.documentElement);
  return {
    bg: cssColor(s, "--bg"),
    violet: cssColor(s, "--facet-violet"),
    indigo: cssColor(s, "--facet-indigo"),
    cyan: cssColor(s, "--facet-cyan"),
    holo: cssColor(s, "--holo"),
  };
}

/* ----------------------------------------------------- environment gates --- */

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface BoundaryState {
  failed: boolean;
}
class WebGLErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  override state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }
  override componentDidCatch(): void {
    /* Shared repo-wide "3D layer off" signal (facet named it first): the page
       CSS shows the static mark in this scene's place. */
    document.documentElement.classList.add("facet-3d-off");
  }
  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/* --------------------------------------------------------- hologram mark --- */

/* Echo layers behind the primary plane fake volume; intensities low because
   the blend is additive (facet scar: stacked layers past ~1.0 clip white). */
interface MarkLayer {
  z: number;
  scale: number;
  intensity: number;
  parallax: number; /* 1 = locked to the group, <1 lags the pointer (reads deeper) */
}
const MARK_LAYERS: readonly MarkLayer[] = [
  { z: -1.0, scale: 1.08, intensity: 0.05, parallax: 0.45 },
  { z: -0.5, scale: 1.04, intensity: 0.11, parallax: 0.72 },
  { z: 0, scale: 1, intensity: 1, parallax: 1 },
];
const MARK_W = 5.4;

const MARK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* The hologram fragment. Composited via ONE/ONE additive RGB (alpha writes
   ZERO/ONE - the canvas alpha-composites over the DOM smoke layer, and plain
   additive alpha turned the plane into an opaque rectangle; facet scar).
   The generated art's near-black wash (~16/255 noise floor) is subtracted
   here so the background adds exactly zero - without it the plane prints its
   bounding rectangle. Check: no visible rectangle edge at full res. */
const MARK_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uReveal;    /* 0..1 bottom-to-top materialization */
  uniform float uIntensity; /* layer brightness (additive: color IS opacity) */
  uniform vec3 uEdge;       /* materialization front tint */
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    /* Interval glitch: a thin band shears sideways for one 8Hz tick. */
    float tick = floor(uTime * 8.0);
    float band = step(0.965, hash(tick + floor(uv.y * 36.0)));
    uv.x += band * (hash(tick + 3.0) - 0.5) * 0.014;

    /* Chromatic drift, amplified inside a glitch band. */
    float ca = 0.0016 + band * 0.005;
    float floorv = 16.0 / 255.0;
    float rescale = 255.0 / (255.0 - 16.0);
    vec3 c;
    c.r = texture2D(uTex, uv + vec2(ca, 0.0)).r;
    c.g = texture2D(uTex, uv).g;
    c.b = texture2D(uTex, uv - vec2(ca, 0.0)).b;
    c = max(c - vec3(floorv), vec3(0.0)) * rescale;

    /* Scanlines: fine raster rolling slowly upward. */
    float scan = 0.84 + 0.16 * sin(uv.y * 640.0 - uTime * 2.2);

    /* Materialization sweep, bottom to top, with a hot line at the front. */
    float front = uReveal * 1.12;
    float vis = 1.0 - smoothstep(front - 0.015, front, uv.y);
    float edge = smoothstep(front - 0.09, front - 0.015, uv.y) * vis * (1.0 - uReveal * 0.999);

    /* Projection flicker: shallow shimmer + rare deeper dropout. */
    float fl = 0.95 + 0.05 * hash(tick * 1.7 + 11.0);
    fl -= step(0.985, hash(floor(uTime * 5.0) + 29.0)) * 0.22;

    vec3 rgb = c * scan * fl * vis * uIntensity + uEdge * edge * 0.55;
    gl_FragColor = vec4(rgb, 0.0);
  }
`;

function markMaterial(intensity: number, edge: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: MARK_VERT,
    fragmentShader: MARK_FRAG,
    uniforms: {
      uTex: { value: null },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uIntensity: { value: intensity },
      uEdge: { value: edge },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
}

function HoloMark({ colors, pointer }: { colors: WireColors; pointer: PointerRef }): ReactElement | null {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(2 / 3);
  const time = useRef(0);

  const materials = useMemo(
    () => MARK_LAYERS.map((l) => markMaterial(l.intensity, colors.holo)),
    [colors],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useEffect(() => {
    let disposed = false;
    const tex = new THREE.TextureLoader().load(WIRE_URL, (t) => {
      if (disposed) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      time.current = 0; /* the materialization sweep times from texture arrival */
      const img = t.image as { width: number; height: number };
      setAspect(img.height / img.width);
      setTexture(t);
    });
    return () => {
      disposed = true;
      tex.dispose();
    };
  }, []);

  useFrame((_, rawDelta) => {
    const g = groupRef.current;
    if (!g || !texture) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    /* Living idle, rotation capped low - a flat additive plane past ~5
       degrees reads as a tilted card (facet scar). */
    const idleY = Math.sin(t * ((Math.PI * 2) / 16)) * THREE.MathUtils.degToRad(3.5);
    const py = pointer.current.x * THREE.MathUtils.degToRad(4);
    const px = -pointer.current.y * THREE.MathUtils.degToRad(2);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idleY + py, 1.2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, px, 1.2, dt);
    g.position.y = Math.sin(t * ((Math.PI * 2) / 9)) * 0.08;

    /* Materialization: ~2.1s ease-out sweep from the emitter upward. */
    const reveal = 1 - Math.pow(1 - Math.min(t / 2.1, 1), 3);
    for (let i = 0; i < MARK_LAYERS.length; i++) {
      const spec = MARK_LAYERS[i];
      const mat = materials[i];
      const mesh = meshRefs.current[i];
      if (!spec || !mat || !mesh) continue;
      mat.uniforms.uTex!.value = texture;
      mat.uniforms.uTime!.value = t + i * 7.3; /* decorrelate layer glitches */
      mat.uniforms.uReveal!.value = reveal;
      const lag = 1 - spec.parallax;
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, pointer.current.x * 0.35 * lag, 1.4, dt);
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, pointer.current.y * 0.2 * lag, 1.4, dt);
    }
  });

  if (!texture) return null;

  return (
    <group ref={groupRef}>
      {MARK_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[0, 0, layer.z]}
          scale={layer.scale}
          renderOrder={10}
          material={materials[i]}
        >
          <planeGeometry args={[MARK_W, MARK_W * aspect]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------- projection assembly --- */

/* The emitter: a hot ring on the bench, a light cone rising to the beast,
   and expanding pulse rings. All additive, all reading the holo token. */

const CONE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    /* Brightest at the emitter (v=0), dissolving upward; faint vertical
       shimmer so the cone reads as light, not glass. */
    float a = pow(1.0 - vUv.y, 2.4) * 0.34;
    a *= 0.85 + 0.15 * sin(vUv.x * 40.0 + uTime * 0.7);
    a *= 0.9 + 0.1 * sin(uTime * 2.1);
    gl_FragColor = vec4(uColor * a, 0.0);
  }
`;

function LightCone({ colors }: { colors: WireColors }): ReactElement {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime!.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 1.05, 0]}>
      {/* Truncated cone: narrow at the emitter, opening up to the beast. */}
      <cylinderGeometry args={[2.35, 0.42, 2.1, 48, 1, true]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={MARK_VERT}
        fragmentShader={CONE_FRAG}
        uniforms={{ uColor: { value: colors.holo }, uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneFactor}
        blendSrcAlpha={THREE.ZeroFactor}
        blendDstAlpha={THREE.OneFactor}
      />
    </mesh>
  );
}

const PULSE_COUNT = 3;
const PULSE_PERIOD = 3.2;

function EmitterBase({ colors }: { colors: WireColors }): ReactElement {
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const mesh = pulseRefs.current[i];
      if (!mesh) continue;
      const phase = ((t + (i * PULSE_PERIOD) / PULSE_COUNT) % PULSE_PERIOD) / PULSE_PERIOD;
      const s = 0.5 + phase * 2.3;
      mesh.scale.setScalar(s);
      (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.28;
    }
  });
  return (
    <group>
      {/* The hot emitter ring. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.022, 12, 64]} />
        <meshBasicMaterial color={colors.holo} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Expanding pulse rings, staggered thirds of the loop. */}
      {Array.from({ length: PULSE_COUNT }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          ref={(el) => {
            pulseRefs.current[i] = el;
          }}
        >
          <ringGeometry args={[0.96, 1, 64]} />
          <meshBasicMaterial color={colors.holo} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* Polar bench grid: faint concentric circles + spokes anchoring the
          projection to a surface, dissolving into the fog. */}
      <PolarGrid colors={colors} />
      <pointLight color={colors.holo} intensity={1.1} distance={7} position={[0, 0.4, 0]} />
    </group>
  );
}

function PolarGrid({ colors }: { colors: WireColors }): ReactElement {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const ringSegments = 72;
    for (const r of [1.1, 1.8, 2.6]) {
      for (let i = 0; i < ringSegments; i++) {
        const a0 = (i / ringSegments) * Math.PI * 2;
        const a1 = ((i + 1) / ringSegments) * Math.PI * 2;
        pts.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r);
      }
    }
    for (let s = 0; s < 12; s++) {
      const a = (s / 12) * Math.PI * 2;
      pts.push(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7, Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={colors.indigo}
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ------------------------------------------------------- hologram dust --- */

/* Soft point-sprite dust, fully GPU-driven. The first pass used small
   octahedra for both the cone motes and the background debris; at hero scale
   they rasterized as hard confetti squares (owner feedback, 2026-07-11).
   Points with a radial-falloff sprite read as projector dust instead.
   Check: no square silhouettes at full res. */

function dustMaterial(vertex: string, colorA: THREE.Color, colorB: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: DUST_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
}

/* Additive soft dot: dim halo + hot core, alpha folded into RGB (ONE/ONE). */
const DUST_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = smoothstep(0.5, 0.06, d);
    float core = smoothstep(0.16, 0.0, d);
    gl_FragColor = vec4(vColor * (halo * 0.4 + core * 0.9) * vAlpha, 0.0);
  }
`;

/* Rising within the projection cone: radius follows the cone wall, fading in
   off the emitter and out under the beast. */
const CONE_DUST_VERT = /* glsl */ `
  attribute vec4 aSeed; /* angle, radiusFrac, phase, speed */
  attribute float aMix;
  attribute float aSize;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float yFrac = fract(aSeed.z + uTime * aSeed.w * 0.28);
    float angle = aSeed.x + uTime * 0.12;
    float r = (0.42 + yFrac * 1.9) * aSeed.y;
    vec3 pos = vec3(cos(angle) * r, yFrac * 3.4, sin(angle) * r);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (56.0 / -mv.z);
    /* 0.55: fine sparks, not fireflies - at full brightness the swarm washed
       out the beast's lower half. */
    vAlpha = min(yFrac / 0.14, 1.0) * (1.0 - smoothstep(0.72, 1.0, yFrac)) * 0.55;
    vColor = mix(uColorA, uColorB, aMix);
  }
`;

/* Deterministic scatter - index-hashed, not Math.random (module-safe). */
function hashAt(i: number, n: number): number {
  return (Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
}

function dustGeometry(
  count: number,
  fill: (i: number, seed: Float32Array, mix: Float32Array, size: Float32Array) => void,
  bounds: THREE.Sphere,
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3); /* placeholder; the shader owns position */
  const seed = new Float32Array(count * 4);
  const mix = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) fill(i, seed, mix, size);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  geo.setAttribute("aMix", new THREE.BufferAttribute(mix, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  /* Shader-driven positions: culling needs an explicit generous bounds. */
  geo.boundingSphere = bounds;
  return geo;
}

const CONE_DUST_COUNT = 90;

function ConeDust({ colors }: { colors: WireColors }): ReactElement {
  const material = useMemo(() => dustMaterial(CONE_DUST_VERT, colors.holo, colors.indigo), [colors]);
  useEffect(() => () => material.dispose(), [material]);

  const geometry = useMemo(
    () =>
      dustGeometry(
        CONE_DUST_COUNT,
        (i, seed, mix, size) => {
          seed[i * 4] = Math.abs(hashAt(i, 1)) * Math.PI * 2;
          seed[i * 4 + 1] = 0.1 + Math.abs(hashAt(i, 2)) * 0.9;
          seed[i * 4 + 2] = Math.abs(hashAt(i, 3));
          seed[i * 4 + 3] = 0.25 + Math.abs(hashAt(i, 4)) * 0.45;
          mix[i] = Math.abs(hashAt(i, 5));
          size[i] = 0.6 + Math.abs(hashAt(i, 6)) * 1.1;
        },
        new THREE.Sphere(new THREE.Vector3(0, 1.7, 0), 6),
      ),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    material.uniforms.uTime!.value = state.clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} renderOrder={9} frustumCulled={false} />;
}

/* ---------------------------------------------------------- depth dust --- */

/* Sparse ambient dust drifting far behind the subject - atmosphere depth,
   kept very dim so it reads as air, not particles. */
const DEPTH_DUST_VERT = /* glsl */ `
  attribute vec4 aSeed; /* x, y0, z, speed */
  attribute float aMix;
  attribute float aSize;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float y = mod(aSeed.y + uTime * aSeed.w + 8.0, 16.0) - 8.0;
    vec3 pos = vec3(aSeed.x, y, aSeed.z);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (70.0 / -mv.z);
    /* Fade near the vertical wrap seam so respawns never pop. */
    vAlpha = (1.0 - smoothstep(6.0, 8.0, abs(y))) * 0.35;
    vColor = mix(uColorA, uColorB, aMix);
  }
`;

const DEPTH_DUST_COUNT = 140;

function DepthDust({ colors }: { colors: WireColors }): ReactElement {
  const material = useMemo(() => dustMaterial(DEPTH_DUST_VERT, colors.indigo, colors.cyan), [colors]);
  useEffect(() => () => material.dispose(), [material]);

  const geometry = useMemo(
    () =>
      dustGeometry(
        DEPTH_DUST_COUNT,
        (i, seed, mix, size) => {
          seed[i * 4] = (hashAt(i, 1) - 0.5) * 26;
          seed[i * 4 + 1] = (hashAt(i, 2) - 0.5) * 16;
          seed[i * 4 + 2] = -3 - Math.abs(hashAt(i, 3)) * 12;
          seed[i * 4 + 3] = 0.05 + Math.abs(hashAt(i, 4)) * 0.1;
          mix[i] = Math.abs(hashAt(i, 5));
          size[i] = 0.8 + Math.abs(hashAt(i, 6)) * 1.6;
        },
        new THREE.Sphere(new THREE.Vector3(0, 0, -9), 20),
      ),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    material.uniforms.uTime!.value = state.clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* -------------------------------------------------------------- subject --- */

/* ?pin=center | ?pin=review - art-review hooks for screenshot tools whose
   capture crop can't reach the right-offset subject (Camoufox: fixed
   1280x720 top-left crop, variable window width). "center" pins the subject
   to screen center; "review" also shrinks and lifts it so the beast AND the
   projection base fit inside the 720px-tall crop. */
type PinMode = "none" | "center" | "review";
function pinMode(): PinMode {
  if (typeof window === "undefined") return "none";
  const pin = new URLSearchParams(window.location.search).get("pin");
  return pin === "center" || pin === "review" ? pin : "none";
}

/* Content-column width - keep in sync with .wrap in wire.astro. */
const WRAP_MAX = 1360;

/* Beast + projection assembly, offset right on wide viewports so the
   headline (left column) sits over open space; centered on narrow. The
   offset anchors to the CONTENT COLUMN, not a viewport fraction (facet scar:
   viewport-relative offset drifted the subject to the monitor edge). */
function Subject({ colors, pointer }: { colors: WireColors; pointer: PointerRef }): ReactElement {
  const width = useThree((s) => s.size.width);
  const viewportWidth = useThree((s) => s.viewport.width);
  const [pin] = useState(pinMode);
  const pinned = pin !== "none";
  const wide = width >= 1024;
  const anchorPx = Math.min(WRAP_MAX, width * 0.94) * 0.36;
  const x = wide && !pinned ? (anchorPx / width) * viewportWidth : 0;
  let scale = wide
    ? THREE.MathUtils.clamp(width / 1440, 0.82, 1.1)
    : THREE.MathUtils.clamp(viewportWidth / 6.4, 0.5, 0.95);
  let y = 0.3;
  if (pin === "review") {
    scale = 0.55;
    y = 0.9;
  }
  return (
    <group position={[x, y, 0]} scale={scale}>
      <HoloMark colors={colors} pointer={pointer} />
      {/* Projection assembly sits below the beast: emitter at -3.2, cone
          rising to the beast's underside, motes climbing through it. */}
      <group position={[0, -3.2, -0.3]}>
        <EmitterBase colors={colors} />
        <LightCone colors={colors} />
        <ConeDust colors={colors} />
      </group>
    </group>
  );
}

/* --------------------------------------------------------------- lights --- */

function Lights(): ReactElement {
  return (
    <>
      <ambientLight color="#20243a" intensity={0.35} />
      <directionalLight color="#c9d4ff" intensity={1.6} position={[-4, 5, 6]} />
      <directionalLight color="#45c6e0" intensity={2.2} position={[6, -1.5, -3]} />
      <pointLight color="#8f7bf0" intensity={0.7} distance={12} position={[-5, 1, 3]} />
    </>
  );
}

/* --------------------------------------------------------------- camera --- */

type PointerRef = { current: { x: number; y: number } };

function CameraDrift(): null {
  const time = useRef(0);
  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    /* Whisper of camera drift only; the subject carries the parallax. */
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(t * 0.05) * 0.3, 0.8, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.cos(t * 0.043) * 0.24, 0.8, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function FirstFrame({ onFrame }: { onFrame: () => void }): null {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      onFrame();
    }
  });
  return null;
}

/* ----------------------------------------------------------------- root --- */

export default function WireHero(): ReactElement | null {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [webglOk] = useState(supportsWebGL);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const [shown, setShown] = useState(false);
  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    const onThemeChange = (): void => setColors(readColors());
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent): void => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = (): void => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        if (last) setInView(last.isIntersecting);
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, webglOk]);

  useEffect(() => {
    /* Pointer parallax only where a fine pointer exists. */
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent): void => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const handleFirstFrame = useCallback(() => setShown(true), []);

  /* Scroll fade: the hologram is a bright centerpiece over the hero and
     recedes to a dim ambient backdrop by the content sections. Driven
     imperatively on the outer container (instant, no transition); the inner
     wrapper carries the one-time reveal fade so the two never fight. */
  useEffect(() => {
    if (!shown) return;
    let raf = 0;
    const apply = (): void => {
      const node = containerRef.current;
      if (!node) return;
      const t = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
      node.style.opacity = String(1 - t * 0.72);
    };
    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [shown]);

  if (reducedMotion || !webglOk) return null;

  const active = inView && pageVisible;
  const containerStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  };
  const revealStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: shown ? 1 : 0,
    transition: "opacity 700ms ease",
  };

  return (
    <div ref={containerRef} style={containerStyle} aria-hidden="true">
      <div style={revealStyle}>
        <WebGLErrorBoundary>
          <Canvas
            frameloop={active ? "always" : "never"}
            dpr={[1, 1.6]}
            camera={{ fov: 40, near: 0.1, far: 60, position: [0, 0, 9] }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
            }}
            style={{ pointerEvents: "none" }}
          >
            <fogExp2 attach="fog" args={[colors.bg.getHex(), 0.028]} />
            <Lights />
            <DepthDust colors={colors} />
            <Subject colors={colors} pointer={pointer} />
            <CameraDrift />
            <FirstFrame onFrame={handleFirstFrame} />
          </Canvas>
        </WebGLErrorBoundary>
      </div>
    </div>
  );
}
