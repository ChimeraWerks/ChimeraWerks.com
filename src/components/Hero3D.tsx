/**
 * Hero3D — "the swarm becoming one animal".
 *
 * Cinematic background scene for a slice hero's #hero-canvas-slot: a swarm of
 * instanced particles in the eight card hues drifts in loose orbits, breathing
 * in and out of convergence onto a slowly turning wireframe-ish torus-knot
 * chimera mark. All color comes from the active theme's CSS custom properties,
 * read once at mount, so the scene follows whichever slice mounts it.
 *
 * Render gates (all inside the component, never at module scope):
 *   prefers-reduced-motion  -> render null (CSS background beneath survives)
 *   WebGL unavailable/fails -> render null silently (error boundary included)
 *   scrolled offscreen      -> frameloop "never" (IntersectionObserver)
 *   document.hidden         -> frameloop "never"
 */

import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

/* ------------------------------------------------------------- theme --- */

const HUE_COUNT = 8;

interface ThemeColors {
  bg: THREE.Color;
  accent: THREE.Color;
  accent2: THREE.Color;
  hues: THREE.Color[];
}

/* Arcane-theme values as fallbacks so a token typo degrades to a coherent
   palette instead of three.js's default white. */
const TOKEN_FALLBACKS: Readonly<Record<string, string>> = {
  "--bg": "#0a0908",
  "--accent": "#a78bf0",
  "--accent-2": "#e0a23a",
  "--card-hue-0": "#50c9c0",
  "--card-hue-1": "#e3b05a",
  "--card-hue-2": "#ec7e6a",
  "--card-hue-3": "#5aa6f0",
  "--card-hue-4": "#9bcb57",
  "--card-hue-5": "#e07ab0",
  "--card-hue-6": "#a38bf0",
  "--card-hue-7": "#e8c167",
};

function cssColor(styles: CSSStyleDeclaration, token: string): THREE.Color {
  const raw = styles.getPropertyValue(token).trim();
  const value = raw !== "" ? raw : (TOKEN_FALLBACKS[token] ?? "#808080");
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(TOKEN_FALLBACKS[token] ?? "#808080");
  }
}

function readThemeColors(): ThemeColors {
  if (typeof window === "undefined") {
    return {
      bg: new THREE.Color(TOKEN_FALLBACKS["--bg"]),
      accent: new THREE.Color(TOKEN_FALLBACKS["--accent"]),
      accent2: new THREE.Color(TOKEN_FALLBACKS["--accent-2"]),
      hues: Array.from(
        { length: HUE_COUNT },
        (_, i) => new THREE.Color(TOKEN_FALLBACKS[`--card-hue-${i}`]),
      ),
    };
  }
  const styles = window.getComputedStyle(document.documentElement);
  return {
    bg: cssColor(styles, "--bg"),
    accent: cssColor(styles, "--accent"),
    accent2: cssColor(styles, "--accent-2"),
    hues: Array.from({ length: HUE_COUNT }, (_, i) =>
      cssColor(styles, `--card-hue-${i}`),
    ),
  };
}

/* ---------------------------------------------------- environment gates --- */

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
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/* Catches WebGL context-creation failures thrown inside <Canvas> that the
   cheap capability probe above cannot predict; the scene simply vanishes. */
interface BoundaryProps {
  children: ReactNode;
}
interface BoundaryState {
  failed: boolean;
}
class WebGLErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }
  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/* ------------------------------------------------------- knot geometry --- */

const KNOT_P = 2;
const KNOT_Q = 3;
const KNOT_RADIUS = 1.7;
const KNOT_TUBE = 0.42;

/* Same centerline formula as THREE.TorusKnotGeometry, so particles flowing
   along this curve track the rendered mark exactly. u in [0, 2*PI*p). */
function knotPoint(u: number, out: THREE.Vector3): THREE.Vector3 {
  const quOverP = (KNOT_Q / KNOT_P) * u;
  const cs = Math.cos(quOverP);
  out.set(
    KNOT_RADIUS * (2 + cs) * 0.5 * Math.cos(u),
    KNOT_RADIUS * (2 + cs) * 0.5 * Math.sin(u),
    KNOT_RADIUS * Math.sin(quOverP) * 0.5,
  );
  return out;
}

/* ------------------------------------------------------------- layout --- */

const CAMERA_FOV = 42;
const CAMERA_DISTANCE = 9;

/* Swarm orbit range (world units off the knot centerline). Kept tight so
   drifters cannot wander over the left text column at any point of the
   breath cycle; the keep-out math below treats ORBIT_R_MIN + ORBIT_R_SPAN
   as the hard halo extent, so widening the orbits automatically widens the
   computed offset. */
const ORBIT_R_MIN = 0.55;
const ORBIT_R_SPAN = 1.1;

/* Bounding-sphere radius of the whole composition around the group origin:
   knot centerline reaches KNOT_RADIUS * 1.5, plus the max swarm orbit.
   The group rotates freely, so treat the bound as a sphere. */
const COMPOSITION_RADIUS = KNOT_RADIUS * 1.5 + ORBIT_R_MIN + ORBIT_R_SPAN;

/* Camera drift + pointer parallax (max ~0.85 world units of camera offset
   with a fixed look target) shifts points off the z=0 focal plane by at most
   0.85 * (COMPOSITION_RADIUS * scale) / CAMERA_DISTANCE ~= 0.21; 0.35 gives
   headroom for the drift extremes. */
const PARALLAX_MARGIN = 0.35;

const WIDE_MIN_WIDTH_PX = 1024;
/* On wide viewports the entire composition must stay right of this fraction
   of viewport width (the slices' left text column plus breathing room). */
const LEFT_KEEP_OUT = 0.52;
const WIDE_SCALE = 0.52;
const WIDE_LOOK_X = 0.9;
const NARROW_OPACITY = 0.4;

interface HeroLayout {
  x: number;
  y: number;
  scale: number;
  lookX: number;
}

/* Projects the composition's bounding sphere against the camera frustum at
   the group plane (z=0) instead of hard-coding a world offset, so the left
   keep-out holds at any aspect ratio. With the camera looking at lookX, a
   world x on that plane projects to viewport fraction
   0.5 + (x - lookX) / (2 * halfW). */
function computeLayout(widthPx: number, heightPx: number): HeroLayout {
  const halfH =
    Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_DISTANCE;
  const halfW = halfH * (widthPx / Math.max(heightPx, 1));

  if (widthPx >= WIDE_MIN_WIDTH_PX) {
    const scale = WIDE_SCALE;
    /* World x that projects to LEFT_KEEP_OUT of the viewport, then push the
       group right until its whole bounding sphere plus drift margin clears it. */
    const leftBoundWorld = (LEFT_KEEP_OUT * 2 - 1) * halfW + WIDE_LOOK_X;
    const x = leftBoundWorld + COMPOSITION_RADIUS * scale + PARALLAX_MARGIN;
    return { x, y: 0.1, scale, lookX: WIDE_LOOK_X };
  }

  /* Narrow: text stacks full-width, so center the mark and fit it to width;
     readability comes from the root dropping opacity to NARROW_OPACITY. */
  const scale = Math.min(0.5, (halfW * 0.85) / COMPOSITION_RADIUS);
  return { x: 0, y: 0.1, scale, lookX: 0 };
}

function useHeroLayout(): HeroLayout {
  const size = useThree((state) => state.size);
  return useMemo(
    () => computeLayout(size.width, size.height),
    [size.width, size.height],
  );
}

/* --------------------------------------------------------------- swarm --- */

const PARTICLE_COUNT = 320;

interface SwarmData {
  u0: Float32Array;
  flow: Float32Array;
  orbitR: Float32Array;
  orbitSpeed: Float32Array;
  phase: Float32Array;
  converge: Float32Array;
  baseScale: Float32Array;
}

function buildSwarm(): SwarmData {
  const u0 = new Float32Array(PARTICLE_COUNT);
  const flow = new Float32Array(PARTICLE_COUNT);
  const orbitR = new Float32Array(PARTICLE_COUNT);
  const orbitSpeed = new Float32Array(PARTICLE_COUNT);
  const phase = new Float32Array(PARTICLE_COUNT);
  const converge = new Float32Array(PARTICLE_COUNT);
  const baseScale = new Float32Array(PARTICLE_COUNT);
  const domain = Math.PI * 2 * KNOT_P;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    u0[i] = Math.random() * domain;
    flow[i] = 0.05 + Math.random() * 0.12;
    /* Squared random biases the population toward the mark, leaving a thin
       halo of far drifters instead of a uniform shell. */
    orbitR[i] = ORBIT_R_MIN + Math.random() * Math.random() * ORBIT_R_SPAN;
    orbitSpeed[i] = (0.15 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1);
    phase[i] = Math.random() * Math.PI * 2;
    converge[i] = 0.35 + Math.random() * 0.6;
    baseScale[i] = 0.5 + Math.random() * 0.9;
  }
  return { u0, flow, orbitR, orbitSpeed, phase, converge, baseScale };
}

function Swarm({ colors }: { colors: ThemeColors }): ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(buildSwarm, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  /* Random start offset so every page load opens on a different swarm pose. */
  const time = useRef(Math.random() * 200);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const tint = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      /* 0.8 damps the hues so the swarm reads as embers, not UI chrome,
         and never fights the light display text above it. */
      tint.copy(colors.hues[i % HUE_COUNT] ?? colors.accent).multiplyScalar(0.8);
      mesh.setColorAt(i, tint);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);

  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    /* Clamp delta so resuming from a paused frameloop or a background tab
       nudges the animation instead of teleporting it. */
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = (data.u0[i] ?? 0) + t * (data.flow[i] ?? 0);
      knotPoint(u, scratch);

      const ph = data.phase[i] ?? 0;
      const a = ph + t * (data.orbitSpeed[i] ?? 0);
      /* Slow per-particle breath between loose orbit and hugging the mark:
         the "swarm becomes one animal" beat. */
      const breath = 0.5 + 0.5 * Math.sin(t * 0.07 + ph * 2.3);
      const d = THREE.MathUtils.lerp(
        data.orbitR[i] ?? 1,
        KNOT_TUBE + 0.16,
        (data.converge[i] ?? 0.5) * breath,
      );

      dummy.position.set(
        scratch.x + Math.cos(a) * d,
        scratch.y + Math.sin(a) * d * 0.85,
        scratch.z + Math.sin(a * 0.6 + ph) * d * 0.7,
      );
      dummy.scale.setScalar(
        (data.baseScale[i] ?? 1) * (0.85 + 0.3 * Math.sin(t * 1.4 + ph * 5)),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      /* Instances roam past the base geometry's bounding sphere; culling by
         it would blink the whole swarm off at screen edges. */
      frustumCulled={false}
    >
      <octahedronGeometry args={[0.045, 0]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

/* -------------------------------------------------------- chimera mark --- */

function createFresnelMaterial(colors: ThemeColors): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: colors.bg.clone() },
      uRim: { value: colors.accent.clone() },
    },
    vertexShader: /* glsl */ `
      varying float vFres;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vec3 v = normalize(-mvPosition.xyz);
        vFres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uRim;
      varying float vFres;
      void main() {
        gl_FragColor = vec4(mix(uBase, uRim, vFres), mix(0.15, 0.55, vFres));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

function ChimeraForm({ colors }: { colors: ThemeColors }): ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);
  const layout = useHeroLayout();

  const fresnelMaterial = useMemo(() => createFresnelMaterial(colors), [colors]);
  /* <primitive> objects are not auto-disposed by R3F. */
  useEffect(() => () => fresnelMaterial.dispose(), [fresnelMaterial]);

  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    group.rotation.set(
      0.35 + Math.sin(t * 0.04) * 0.12,
      t * 0.06,
      Math.cos(t * 0.05) * 0.06,
    );
  });

  return (
    /* Position and scale come from computeLayout: on wide viewports the whole
       bounding sphere clears the left text keep-out; on narrow ones the mark
       centers behind the stacked text. */
    <group
      ref={groupRef}
      position={[layout.x, layout.y, 0]}
      scale={layout.scale}
    >
      <mesh>
        <torusKnotGeometry args={[KNOT_RADIUS, KNOT_TUBE, 168, 20, KNOT_P, KNOT_Q]} />
        <primitive object={fresnelMaterial} attach="material" />
      </mesh>
      <mesh scale={1.015}>
        <torusKnotGeometry args={[KNOT_RADIUS, KNOT_TUBE, 96, 12, KNOT_P, KNOT_Q]} />
        {/* Kept below the fresnel body's rim intensity so the overlay never
            produces hot lines under text edges. */}
        <meshBasicMaterial
          color={colors.accent2}
          wireframe
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
      <Swarm colors={colors} />
    </group>
  );
}

/* -------------------------------------------------------------- camera --- */

type PointerRef = { current: { x: number; y: number } };

function CameraRig({ pointer }: { pointer: PointerRef }): null {
  const time = useRef(0);
  const layout = useHeroLayout();
  /* Look target follows the layout: right-biased on wide viewports, centered
     on narrow ones, so the perspective center matches the composition. */
  const lookTarget = useMemo(
    () => new THREE.Vector3(layout.lookX, 0, 0),
    [layout.lookX],
  );

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    /* Slow lissajous drift plus pointer parallax; ~0.4 world units at 9
       units distance keeps the parallax under ~3 degrees. */
    const targetX = Math.sin(t * 0.05) * 0.45 + pointer.current.x * 0.4;
    const targetY = 0.35 + Math.cos(t * 0.041) * 0.3 + pointer.current.y * 0.28;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 1.2, dt);
    camera.lookAt(lookTarget);
  });

  return null;
}

/* Fires once from inside the render loop, i.e. after a real first frame has
   been drawn, which is what gates the container fade-in. */
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

/* ---------------------------------------------------------------- root --- */

export default function Hero3D(): ReactElement | null {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [webglOk] = useState(supportsWebGL);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const [shown, setShown] = useState(false);
  /* Wide vs narrow tracks the same breakpoint as computeLayout: narrow
     viewports center the mark under full-width text, so the whole scene
     drops to NARROW_OPACITY to keep that text readable. */
  const [wide, setWide] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia(`(min-width: ${WIDE_MIN_WIDTH_PX}px)`).matches,
  );

  const colors = useMemo(readThemeColors, []);
  const handleFirstFrame = useCallback(() => setShown(true), []);

  /* Honor a mid-session switch to reduced motion, not just the mount value. */
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent): void =>
      setReducedMotion(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${WIDE_MIN_WIDTH_PX}px)`);
    const onChange = (event: MediaQueryListEvent): void =>
      setWide(event.matches);
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
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    /* Re-attach if the container appears after reduced-motion flips off. */
  }, [reducedMotion, webglOk]);

  useEffect(() => {
    /* Window-level listener: the container is pointer-events: none. */
    const onMove = (event: PointerEvent): void => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (reducedMotion || !webglOk) return null;

  const active = inView && pageVisible;
  const containerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: shown ? (wide ? 1 : NARROW_OPACITY) : 0,
    transition: "opacity 600ms ease",
  };

  return (
    <div ref={containerRef} style={containerStyle} aria-hidden="true">
      <WebGLErrorBoundary>
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 1.5]}
          /* NoToneMapping: theme hexes must land on screen as authored. */
          flat
          camera={{
            fov: CAMERA_FOV,
            near: 0.1,
            far: 60,
            position: [0, 0.35, CAMERA_DISTANCE],
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          style={{ pointerEvents: "none" }}
        >
          {/* Linear fog toward --bg sinks far drifters into the page. */}
          <fog attach="fog" args={[colors.bg, 7, 16]} />
          <ChimeraForm colors={colors} />
          <CameraRig pointer={pointer} />
          <FirstFrame onFrame={handleFirstFrame} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
