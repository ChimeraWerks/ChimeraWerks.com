/**
 * LowPolyHero — the spatial-VR cut's signature scene.
 *
 * A faceted crystalline chimera-core: a low-poly deformed icosphere flat-
 * shaded so every triangle reads as a discrete plane, colored on the brand
 * diagonal (violet goat top-left -> indigo lion center -> cyan serpent
 * bottom-right), lifted off pure black by a cool-white key from upper-left
 * and a cyan back-rim. Three faceted shards orbit it (the three strands); a
 * volumetric field of low-poly debris drifts behind, dissolving into fog.
 *
 * Material + light rig + motion follow the ui-design system spec:
 * flat shading, key #c9d4ff@2.6 upper-left, rim #45c6e0@2.0 behind-right,
 * indigo fill, dark-blue ambient; idle survey rotation, glassy pointer
 * parallax (move the subject, not the camera), scroll scale+fade.
 *
 * Render gates mirror Hero3D (the proven ones): prefers-reduced-motion and
 * no-WebGL render null (CSS ground survives); offscreen or hidden tab pause
 * the frameloop; a WebGL error boundary makes a context failure vanish
 * silently. Colors come from the active theme's tokens, read at mount and on
 * the themechange event, so the scene follows whatever page mounts it.
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

/* --------------------------------------------------------------- theme --- */

interface FacetColors {
  bg: THREE.Color;
  violet: THREE.Color;
  indigo: THREE.Color;
  cyan: THREE.Color;
  shard: THREE.Color[];
}

const FALLBACKS: Readonly<Record<string, string>> = {
  "--bg": "#0a0b0f",
  "--facet-violet": "#8f7bf0",
  "--facet-indigo": "#6c63f5",
  "--facet-cyan": "#45c6e0",
  "--card-hue-1": "#7c74ff",
  "--card-hue-3": "#8f7bf5",
  "--card-hue-0": "#45c6e0",
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

function readColors(): FacetColors {
  if (typeof window === "undefined") {
    return {
      bg: new THREE.Color(FALLBACKS["--bg"]),
      violet: new THREE.Color(FALLBACKS["--facet-violet"]),
      indigo: new THREE.Color(FALLBACKS["--facet-indigo"]),
      cyan: new THREE.Color(FALLBACKS["--facet-cyan"]),
      shard: [
        new THREE.Color(FALLBACKS["--card-hue-1"]),
        new THREE.Color(FALLBACKS["--card-hue-3"]),
        new THREE.Color(FALLBACKS["--card-hue-0"]),
      ],
    };
  }
  const s = window.getComputedStyle(document.documentElement);
  return {
    bg: cssColor(s, "--bg"),
    violet: cssColor(s, "--facet-violet"),
    indigo: cssColor(s, "--facet-indigo"),
    cyan: cssColor(s, "--facet-cyan"),
    shard: [cssColor(s, "--card-hue-1"), cssColor(s, "--card-hue-3"), cssColor(s, "--card-hue-0")],
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
  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/* -------------------------------------------------------- core geometry --- */

const CORE_RADIUS = 1.9;

/* Deterministic value noise from vertex coords — no per-load variance so the
   silhouette is stable, no dependency on Math.random at module scope. Two
   octaves: the high-frequency one is what keeps adjacent facets from
   agreeing, so the form reads as cut planes instead of an inflated ball. */
function noise3(x: number, y: number, z: number): number {
  const a = Math.sin(x * 1.7 + 0.3) + Math.sin(y * 2.3 + 1.1) + Math.sin(z * 1.9 + 2.7);
  const b = Math.sin(x * 4.3 + 5.2) + Math.sin(y * 3.9 + 0.8) + Math.sin(z * 4.7 + 3.3);
  return (a / 3) * 0.65 + (b / 3) * 0.35;
}

/* Faceted crystal, flat-shaded, vertex-colored on the brand diagonal
   (violet -> indigo -> cyan across x-minus-y). Detail 2 (320 faces), not 3:
   fewer, larger planes are the whole low-poly read — at detail 3 the same
   noise renders as a smooth potato (seen in the v1 render). Displacement is
   strong, then the form is elongated on y so the silhouette is a shard,
   not a sphere. */
function buildCore(colors: FacetColors): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(CORE_RADIUS, 2).toNonIndexed();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const dir = v.clone().normalize();
    const bump = 1 + noise3(dir.x * 2.2, dir.y * 2.2, dir.z * 2.2) * 0.34;
    v.multiplyScalar(bump);
    v.set(v.x * 0.96, v.y * 1.18, v.z * 0.92);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.rotateZ(-0.22);
  /* Flat facets: drop smoothed normals, recompute per-face. */
  geo.deleteAttribute("normal");
  geo.computeVertexNormals();

  /* Diagonal gradient: t along (x - y). Cyan gets the bottom 45% of the ramp
     (not an even split) — with ACES tonemapping an even split left the cyan
     strand invisible in the render. */
  const colorAttr = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const d = pos.getX(i) - pos.getY(i);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  const span = max - min || 1;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getX(i) - pos.getY(i) - min) / span;
    if (t < 0.48) c.copy(colors.violet).lerp(colors.indigo, t / 0.48);
    else c.copy(colors.indigo).lerp(colors.cyan, (t - 0.48) / 0.52);
    colorAttr[i * 3] = c.r;
    colorAttr[i * 3 + 1] = c.g;
    colorAttr[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colorAttr, 3));
  return geo;
}

function FacetCore({ colors, pointer }: { colors: FacetColors; pointer: PointerRef }): ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const geo = useMemo(() => buildCore(colors), [colors]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 18), [geo]);
  const time = useRef(0);

  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, rawDelta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    /* Idle survey + living tilt + bob (spec §6). */
    const idleY = Math.sin(t * ((Math.PI * 2) / 14)) * THREE.MathUtils.degToRad(6);
    const idleX = Math.sin(t * ((Math.PI * 2) / 9)) * THREE.MathUtils.degToRad(1.5);
    /* Glassy pointer parallax — move the subject, heavy lerp. */
    const py = pointer.current.x * THREE.MathUtils.degToRad(7);
    const px = -pointer.current.y * THREE.MathUtils.degToRad(4);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idleY + py, 1.2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, idleX + px, 1.2, dt);
    g.position.y = Math.sin(t * ((Math.PI * 2) / 7)) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo}>
        {/* Emissive low: a uniform glow fills shadowed facets and flattens the
            plane-vs-plane value contrast the whole look depends on. */}
        <meshStandardMaterial
          vertexColors
          flatShading
          metalness={0.22}
          roughness={0.55}
          emissive={colors.indigo}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* Faint plane-seam tracing — reinforces cut geometry, not a cartoon wire. */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          color={colors.violet}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* --------------------------------------------------------------- shards --- */

interface ShardSpec {
  radius: number;
  speed: number;
  phase: number;
  incline: number;
  size: number;
  hue: number;
}
const SHARDS: readonly ShardSpec[] = [
  { radius: 3.0, speed: 0.16, phase: 0.4, incline: 0.4, size: 0.42, hue: 0 },
  { radius: 3.6, speed: 0.12, phase: 2.6, incline: -0.28, size: 0.36, hue: 1 },
  { radius: 4.1, speed: 0.095, phase: 4.7, incline: 0.16, size: 0.3, hue: 2 },
];

/* Three strands, three distinct silhouettes — identical icosahedra read as
   generic particles, not "the three that make the chimera". */
const SHARD_GEOMETRY: readonly ReactElement[] = [
  <octahedronGeometry args={[1, 0]} />,
  <tetrahedronGeometry args={[1, 0]} />,
  <icosahedronGeometry args={[1, 0]} />,
];

function Shard({ spec, colors }: { spec: ShardSpec; colors: FacetColors }): ReactElement {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(spec.phase * 3);
  const tint = colors.shard[spec.hue] ?? colors.indigo;

  useFrame((_, rawDelta) => {
    const m = meshRef.current;
    if (!m) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const a = time.current * spec.speed * Math.PI * 2 + spec.phase;
    /* z amplitude damped: at full radius the shard swings so far toward the
       camera it leaves the frame — only one of three was visible in v1. */
    m.position.set(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius * 0.4, Math.sin(a) * spec.radius * 0.5);
    m.rotation.x = a * 1.3;
    m.rotation.y = a * 0.9;
  });

  return (
    <group rotation={[spec.incline, 0, spec.incline * 0.5]}>
      <mesh ref={meshRef} scale={spec.size}>
        {SHARD_GEOMETRY[spec.hue] ?? SHARD_GEOMETRY[0]}
        <meshStandardMaterial
          color={tint}
          flatShading
          metalness={0.2}
          roughness={0.5}
          emissive={tint}
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------- debris field --- */

const DEBRIS_COUNT = 84;

function DebrisField({ colors }: { colors: FacetColors }): ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = useRef(0);

  const seeds = useMemo(() => {
    const arr = new Float32Array(DEBRIS_COUNT * 5); /* x,y,z,speed,spin */
    /* Deterministic scatter — index-hashed, not Math.random (module-safe). */
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      const h = (n: number) => (Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
      arr[i * 5] = (h(1) - 0.5) * 26;
      arr[i * 5 + 1] = (h(2) - 0.5) * 16;
      arr[i * 5 + 2] = -3 - Math.abs(h(3)) * 12;
      arr[i * 5 + 3] = 0.05 + Math.abs(h(4)) * 0.1;
      arr[i * 5 + 4] = 0.1 + Math.abs(h(5)) * 0.2;
    }
    return arr;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const tint = new THREE.Color();
    const ramp = [colors.cyan, colors.indigo, colors.violet];
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      tint.copy(ramp[i % 3] ?? colors.indigo).multiplyScalar(0.6 + (i % 4) * 0.12);
      mesh.setColorAt(i, tint);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);

  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      const x = seeds[i * 5] as number;
      const y0 = seeds[i * 5 + 1] as number;
      const z = seeds[i * 5 + 2] as number;
      const speed = seeds[i * 5 + 3] as number;
      const spin = seeds[i * 5 + 4] as number;
      const y = ((y0 + t * speed + 8) % 16) - 8;
      dummy.position.set(x, y, z);
      dummy.rotation.set(t * spin, t * spin * 0.7, 0);
      const s = 0.05 + Math.abs(z) * 0.006;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DEBRIS_COUNT]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial transparent opacity={0.38} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------- subject --- */

/* Core + shards, offset right on wide viewports so the headline (left column)
   sits over open space, not the bright core; centered on narrow where content
   stacks full-width. The offset is a fraction of the visible world width, not
   a fixed unit — a fixed x=2.6 left the core behind the headline at 1024 and
   still touching it at 1440 (seen in the v1 render). Slight down-scale below
   1440 keeps the core's left edge clear of the copy column. */
function Subject({ colors, pointer }: { colors: FacetColors; pointer: PointerRef }): ReactElement {
  const width = useThree((s) => s.size.width);
  const viewportWidth = useThree((s) => s.viewport.width);
  const wide = width >= 1024;
  const x = wide ? Math.min(viewportWidth * 0.33, 6) : 0;
  /* Narrow: fit the core (~4.6 world units wide) inside the viewport with a
     margin — at full scale it fills the fold edge-to-edge and the silhouette
     ("one form") never reads, it's just a wall of facets behind the copy. */
  const scale = wide
    ? THREE.MathUtils.clamp(width / 1440, 0.82, 1)
    : THREE.MathUtils.clamp(viewportWidth / 5.8, 0.55, 1);
  return (
    <group position={[x, 0.15, 0]} scale={scale}>
      <FacetCore colors={colors} pointer={pointer} />
      {SHARDS.map((spec, i) => (
        <Shard key={i} spec={spec} colors={colors} />
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- lights --- */

function Lights(): ReactElement {
  return (
    <>
      <ambientLight color="#20243a" intensity={0.35} />
      <directionalLight color="#c9d4ff" intensity={2.6} position={[-4, 5, 6]} />
      {/* Rim hot and angled toward camera-right-low: the cyan edge is what
          separates the core from the near-black bg — at 2.0 straight behind,
          it vanished under ACES tonemapping and no camera-facing facet ever
          caught it. */}
      <directionalLight color="#45c6e0" intensity={3.2} position={[6, -1.5, -3]} />
      <directionalLight color="#6f78d8" intensity={0.6} position={[3, -3, 4]} />
      <pointLight color="#8f7bf0" intensity={0.9} distance={12} position={[-5, 1, 3]} />
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

export default function LowPolyHero(): ReactElement | null {
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
    /* Pointer parallax only where a fine pointer exists (spec §6). */
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent): void => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const handleFirstFrame = useCallback(() => setShown(true), []);

  /* Scroll fade (spec §6): the core is a bright centerpiece over the hero and
     recedes to a dim ambient backdrop by the time content-heavy sections
     arrive, so glass panels and bare headings stay legible. Driven
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
          <DebrisField colors={colors} />
          <Subject colors={colors} pointer={pointer} />
          <CameraDrift />
          <FirstFrame onFrame={handleFirstFrame} />
        </Canvas>
      </WebGLErrorBoundary>
      </div>
    </div>
  );
}
