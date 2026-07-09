/**
 * LowPolyHero — the spatial-VR cut's signature scene.
 *
 * The centerpiece is the faceted chimera mark (goat/lion/serpent, the brand
 * diagonal) on a parallax stack of additive planes — Phase 2's literal head.
 * The v1 abstract crystal (low-poly deformed icosphere, flat-shaded, vertex-
 * colored on the same diagonal) stays reachable via ?core=crystal for
 * comparison. Three faceted shards orbit the centerpiece (the three
 * strands); a volumetric field of low-poly debris drifts behind, dissolving
 * into fog.
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
import markAsset from "../assets/marks/chimera-facet.webp";

/* Astro's Vite pipeline returns ImageMetadata for image imports; plain Vite
   returns a URL string. Accept either so the component survives both. */
const MARK_URL: string =
  typeof markAsset === "string" ? markAsset : (markAsset as { src: string }).src;

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
  override componentDidCatch(): void {
    /* A context failure must not erase the brand: html.facet-3d-off makes
       the page show the static mark in this scene's place. */
    document.documentElement.classList.add("facet-3d-off");
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

/* --------------------------------------------------------- chimera mark --- */

/* The literal centerpiece (Phase 2): the faceted chimera mark on a stack of
   additive planes. The art was generated on black (the CIL backend rejects
   transparent bg), and additive blending is what makes that work — black adds
   nothing, so only the crystal glow composites over the scene. Two dim echo
   layers behind the mark plus per-layer pointer parallax fake the volume a
   flat plane doesn't have. */
interface MarkLayer {
  z: number;
  scale: number;
  opacity: number;
  parallax: number; /* 1 = locked to the group, <1 lags the pointer (reads deeper) */
}
/* Echo opacities low: all three layers carry the same art and the blend is
   additive — much higher and the lion face stacks past 1.0 and clips to
   white (seen at full res). */
const MARK_LAYERS: readonly MarkLayer[] = [
  { z: -1.1, scale: 1.09, opacity: 0.04, parallax: 0.45 },
  { z: -0.55, scale: 1.04, opacity: 0.1, parallax: 0.72 },
  { z: 0, scale: 1, opacity: 1, parallax: 1 },
];
const MARK_SIZE = 4.7;

/* The generated art's background is near-black, not black (~rgb(8,8,12) noise
   floor) — under ONE/ONE additive blending that wash prints the plane's
   bounding rectangle over the page. Subtract the floor and rescale so the
   background adds exactly zero. Check: no visible rectangle edge at full res. */
const BLACK_FLOOR = 16;

function keyOutBlackFloor(img: HTMLImageElement): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const rescale = 255 / (255 - BLACK_FLOOR);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = Math.max(0, (px[i] as number) - BLACK_FLOOR) * rescale;
    px[i + 1] = Math.max(0, (px[i + 1] as number) - BLACK_FLOOR) * rescale;
    px[i + 2] = Math.max(0, (px[i + 2] as number) - BLACK_FLOOR) * rescale;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function ChimeraMark({ pointer }: { pointer: PointerRef }): ReactElement | null {
  const groupRef = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const time = useRef(0);

  useEffect(() => {
    let disposed = false;
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      const keyed = keyOutBlackFloor(img);
      if (!keyed) return;
      const tex = new THREE.CanvasTexture(keyed);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      time.current = 0; /* restart the clock: the reveal ramp times from texture arrival */
      setTexture(tex);
    };
    img.src = MARK_URL;
    return () => {
      disposed = true;
    };
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame((_, rawDelta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;
    /* Same living-idle grammar as the crystal, but rotation capped low — a
       flat additive plane past ~5 degrees reads as a tilted card. */
    const idleY = Math.sin(t * ((Math.PI * 2) / 16)) * THREE.MathUtils.degToRad(3.5);
    const py = pointer.current.x * THREE.MathUtils.degToRad(4);
    const px = -pointer.current.y * THREE.MathUtils.degToRad(2);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idleY + py, 1.2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, px, 1.2, dt);
    g.position.y = Math.sin(t * ((Math.PI * 2) / 9)) * 0.08;
    /* Reveal: the texture arrives a beat after the canvas fade (image decode
       + floor keying), so the mark eases in via its color multiplier — ONE/ONE
       blending ignores opacity, color is the only brightness channel. */
    const reveal = 1 - Math.pow(1 - Math.min(time.current / 1.1, 1), 3);
    for (let i = 0; i < MARK_LAYERS.length; i++) {
      const m = layerRefs.current[i];
      const spec = MARK_LAYERS[i];
      if (!m || !spec) continue;
      (m.material as THREE.MeshBasicMaterial).color.setScalar(spec.opacity * reveal);
      const lag = 1 - spec.parallax;
      m.position.x = THREE.MathUtils.damp(m.position.x, pointer.current.x * 0.35 * lag, 1.4, dt);
      m.position.y = THREE.MathUtils.damp(m.position.y, pointer.current.y * 0.2 * lag, 1.4, dt);
    }
  });

  if (!texture) return null;

  return (
    <group ref={groupRef}>
      {MARK_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          position={[0, 0, layer.z]}
          scale={layer.scale}
          renderOrder={10}
        >
          <planeGeometry args={[MARK_SIZE, MARK_SIZE]} />
          {/* Custom blending, not AdditiveBlending: RGB adds (ONE/ONE) but
              alpha writes ZERO/ONE — the canvas is alpha-composited over the
              DOM smoke layer, and plain additive still writes alpha≈1, which
              turned the plane into an opaque black rectangle over the page.
              Layer dimming rides the color multiplier since ONE/ONE ignores
              opacity. depthTest off + late renderOrder: opaque shards
              crossing the plane's depth otherwise punch culled holes in the
              glow. */}
          {/* fog off: fogExp2 mixes toward #0a0b0f (not black) across every
              fragment, and under ONE/ONE additive that uniform wash prints
              the plane's bounding rectangle. */}
          <meshBasicMaterial
            map={texture}
            color={new THREE.Color(layer.opacity, layer.opacity, layer.opacity)}
            fog={false}
            transparent
            blending={THREE.CustomBlending}
            blendEquation={THREE.AddEquation}
            blendSrc={THREE.OneFactor}
            blendDst={THREE.OneFactor}
            blendSrcAlpha={THREE.ZeroFactor}
            blendDstAlpha={THREE.OneFactor}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------- dna ascent --- */

/* The biology spine (brand decision: scientific chimera over myth): a
   low-poly double helix — two strands of faceted particles, distinct genomes
   in violet and cyan — ascending toward the mark. Past the fusion point the
   strands converge onto the axis and shrink away, so the read is literal:
   separate strands fuse into the one form above. Built from the facet
   world's own vocabulary (instanced polyhedra, like the debris), not the
   smooth-tube helix from Hero3D. */
const HELIX_SEGMENTS = 36; /* particles per strand */
const HELIX_HEIGHT = 6.2;
const HELIX_RADIUS = 0.55;
const HELIX_TURNS = 2.4;
const FUSE_START = 0.72; /* strand fraction where convergence begins */
const RUNG_EVERY = 3;

function DnaAscent({ colors }: { colors: FacetColors }): ReactElement {
  const strandARef = useRef<THREE.InstancedMesh>(null);
  const strandBRef = useRef<THREE.InstancedMesh>(null);
  const rungRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = useRef(0);
  const rungCount = Math.floor(HELIX_SEGMENTS / RUNG_EVERY);

  useEffect(() => {
    const tint = new THREE.Color();
    const strandA = strandARef.current;
    const strandB = strandBRef.current;
    if (strandA) {
      for (let i = 0; i < HELIX_SEGMENTS; i++) {
        const t = i / (HELIX_SEGMENTS - 1);
        tint.copy(colors.violet).lerp(colors.indigo, t);
        strandA.setColorAt(i, tint);
      }
      if (strandA.instanceColor) strandA.instanceColor.needsUpdate = true;
    }
    if (strandB) {
      for (let i = 0; i < HELIX_SEGMENTS; i++) {
        const t = i / (HELIX_SEGMENTS - 1);
        tint.copy(colors.cyan).lerp(colors.indigo, t * 0.5);
        strandB.setColorAt(i, tint);
      }
      if (strandB.instanceColor) strandB.instanceColor.needsUpdate = true;
    }
  }, [colors]);

  useFrame((_, rawDelta) => {
    const strandA = strandARef.current;
    const strandB = strandBRef.current;
    const rungs = rungRef.current;
    if (!strandA || !strandB || !rungs) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const spin = time.current * 0.35;

    const place = (mesh: THREE.InstancedMesh, i: number, t: number, phase: number): void => {
      const a = t * HELIX_TURNS * Math.PI * 2 + phase + spin;
      /* Fusion: past FUSE_START the strand pulls onto the axis and shrinks —
         two genomes becoming one line, dissolving where the mark begins. */
      const fuse =
        t <= FUSE_START ? 0 : Math.pow((t - FUSE_START) / (1 - FUSE_START), 1.4);
      const r = HELIX_RADIUS * (1 - fuse);
      dummy.position.set(Math.cos(a) * r, (t - 0.5) * HELIX_HEIGHT, Math.sin(a) * r);
      dummy.rotation.set(a, a * 0.7, 0);
      dummy.scale.setScalar(0.085 * (1 - fuse * 0.85));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };

    for (let i = 0; i < HELIX_SEGMENTS; i++) {
      const t = i / (HELIX_SEGMENTS - 1);
      place(strandA, i, t, 0);
      place(strandB, i, t, Math.PI);
    }
    strandA.instanceMatrix.needsUpdate = true;
    strandB.instanceMatrix.needsUpdate = true;

    /* Base-pair rungs: thin bars bridging the strands, gone past fusion. */
    for (let i = 0; i < rungCount; i++) {
      const t = (i * RUNG_EVERY) / (HELIX_SEGMENTS - 1);
      const a = t * HELIX_TURNS * Math.PI * 2 + spin;
      const fuse = t <= FUSE_START ? 0 : 1;
      dummy.position.set(0, (t - 0.5) * HELIX_HEIGHT, 0);
      dummy.rotation.set(0, -a, Math.PI / 2);
      dummy.scale.set(fuse ? 0.0001 : 0.028, HELIX_RADIUS * 2 * 0.92, fuse ? 0.0001 : 0.028);
      dummy.updateMatrix();
      rungs.setMatrixAt(i, dummy.matrix);
    }
    rungs.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={strandARef} args={[undefined, undefined, HELIX_SEGMENTS]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading metalness={0.2} roughness={0.5} emissive={colors.violet} emissiveIntensity={0.3} />
      </instancedMesh>
      <instancedMesh ref={strandBRef} args={[undefined, undefined, HELIX_SEGMENTS]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading metalness={0.2} roughness={0.5} emissive={colors.cyan} emissiveIntensity={0.3} />
      </instancedMesh>
      <instancedMesh ref={rungRef} args={[undefined, undefined, rungCount]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={colors.indigo}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
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
    /* z amplitude damped (at full radius the shard swings out of frame —
       only one of three was visible in v1) and biased behind the mark plane
       so shards orbit the head, never parade in front of the art. */
    m.position.set(
      Math.cos(a) * spec.radius,
      Math.sin(a) * spec.radius * 0.4,
      Math.sin(a) * spec.radius * 0.4 - 0.9,
    );
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

const DEBRIS_COUNT = 128;

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

/* Centerpiece pick: the chimera mark is the product; ?core=crystal keeps the
   v1 abstract crystal alive for side-by-side judgment at the preview alias. */
type CoreVariant = "mark" | "crystal";
function coreVariant(): CoreVariant {
  if (typeof window === "undefined") return "mark";
  return new URLSearchParams(window.location.search).get("core") === "crystal"
    ? "crystal"
    : "mark";
}

/* ?pin=center | ?pin=review — art-review hooks for screenshot tools whose
   capture crop can't reach the right-offset subject (Camoufox: fixed
   1280x720 top-left crop, variable window width). "center" pins the subject
   to screen center; "review" also shrinks and lifts it so the mark AND the
   dna ascent below it fit inside the 720px-tall crop. */
type PinMode = "none" | "center" | "review";
function pinMode(): PinMode {
  if (typeof window === "undefined") return "none";
  const pin = new URLSearchParams(window.location.search).get("pin");
  return pin === "center" || pin === "review" ? pin : "none";
}

/* Content-column width — keep in sync with .wrap in facet.astro. */
const WRAP_MAX = 1360;

/* Core + shards, offset right on wide viewports so the headline (left column)
   sits over open space; centered on narrow where content stacks full-width.
   The offset anchors to the CONTENT COLUMN, not a viewport fraction: a
   viewport-relative offset detached the subject from the copy on widescreen
   (it drifted toward the monitor edge while the centered wrap stayed put) —
   the subject belongs to the layout. */
function Subject({ colors, pointer }: { colors: FacetColors; pointer: PointerRef }): ReactElement {
  const width = useThree((s) => s.size.width);
  const viewportWidth = useThree((s) => s.viewport.width);
  const [variant] = useState(coreVariant);
  const [pin] = useState(pinMode);
  const pinned = pin !== "none";
  const wide = width >= 1024;
  /* Subject center at 72% of the wrap half-width right of page center: hugs
     the copy column's right side, bleeds slightly past the wrap edge. */
  const anchorPx = Math.min(WRAP_MAX, width * 0.94) * 0.36;
  const x = wide && !pinned ? (anchorPx / width) * viewportWidth : 0;
  /* Narrow: fit the core (~4.6 world units wide) inside the viewport with a
     margin — at full scale it fills the fold edge-to-edge and the silhouette
     ("one form") never reads, it's just a wall of facets behind the copy. */
  let scale = wide
    ? THREE.MathUtils.clamp(width / 1440, 0.82, 1.1)
    : THREE.MathUtils.clamp(viewportWidth / 5.8, 0.55, 1);
  let y = 0.15;
  if (pin === "review") {
    scale = 0.6;
    y = 0.8;
  }
  return (
    <group position={[x, y, 0]} scale={scale}>
      {variant === "mark" ? (
        <ChimeraMark pointer={pointer} />
      ) : (
        <FacetCore colors={colors} pointer={pointer} />
      )}
      {/* Ascends from below the fold into the mark's base: strands enter
          frame mid-climb, fuse, and dissolve where the one form begins. */}
      <group position={[0, -3.7, -0.6]} rotation={[0, 0, -0.14]}>
        <DnaAscent colors={colors} />
      </group>
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
