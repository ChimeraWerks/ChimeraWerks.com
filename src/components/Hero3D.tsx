/**
 * Hero3D — "the chimera genome".
 *
 * Cinematic background scene for a slice hero's #hero-canvas-slot: a DNA
 * double helix built from two parametric strands — one tinted from --accent
 * (iris), one from --accent-2 (amber), the signature pair braided together —
 * crossed by base-pair rungs cycling the eight card hues (agents as base
 * pairs). The top ~15% of the helix unwinds: the strand radius flares apart
 * and two or three free rungs drift in the gap — the genome being read and
 * written. A tight halo of instanced micro-particles breathes around the
 * whole mark. All color comes from the active theme's CSS custom properties,
 * read once at mount, so the scene follows whichever slice mounts it.
 *
 * Render gates (all inside the component, never at module scope):
 *   prefers-reduced-motion  -> render null (CSS background beneath survives)
 *   WebGL unavailable/fails -> render null silently (error boundary included)
 *   scrolled offscreen      -> frameloop "never" (IntersectionObserver)
 *   document.hidden         -> frameloop "never"
 *
 * Perf shape: 4 draw calls (two strand tubes, one rung InstancedMesh, one
 * halo InstancedMesh), zero per-frame allocations, fixed rung matrices are
 * written once — only the drifter rungs and halo animate per frame.
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

/* ------------------------------------------------------ helix geometry --- */

const HELIX_TURNS = 3.5;
const HELIX_HEIGHT = 4.6;
const HELIX_RADIUS = 0.55;
const TUBE_RADIUS = 0.085;
/* Real B-DNA strands sit ~2.1-2.4 rad apart around the axis (that asymmetry
   is what makes major/minor grooves); PI here would read as a generic braid.
   Rung chords therefore skip the axis, which is the biological tell. */
const STRAND_PHASE_OFFSET = 2.2;
/* Unwinding: past this curve parameter the strand radius flares open. */
const FLARE_START = 0.85;
const FLARE_AMOUNT = 1.7;

/* Smoothstep 0->1 across the flare zone; 0 for the whole paired region. */
function flareEase(t: number): number {
  const k = THREE.MathUtils.clamp((t - FLARE_START) / (1 - FLARE_START), 0, 1);
  return k * k * (3 - 2 * k);
}

/* Shared strand equation: strands, rungs, and drifters all sample this one
   function, so the rungs stay welded to the rendered tubes by construction.
   t in [0, 1], y centered on 0, top (t=1) is the unwound end. */
function helixPoint(t: number, phase: number, out: THREE.Vector3): THREE.Vector3 {
  const angle = t * HELIX_TURNS * Math.PI * 2 + phase;
  const r = HELIX_RADIUS * (1 + FLARE_AMOUNT * flareEase(t));
  out.set(
    Math.cos(angle) * r,
    (t - 0.5) * HELIX_HEIGHT,
    Math.sin(angle) * r,
  );
  return out;
}

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  private readonly phase: number;
  constructor(phase: number) {
    super();
    this.phase = phase;
  }
  override getPoint(
    t: number,
    optionalTarget: THREE.Vector3 = new THREE.Vector3(),
  ): THREE.Vector3 {
    return helixPoint(t, this.phase, optionalTarget);
  }
}

/* Axis tilt in the screen plane (~20 deg) plus a whisper of depth pitch so
   the axis foreshortens instead of reading as a flat 2D zigzag. */
const AXIS_TILT_Z = 0.36;
const AXIS_TILT_X = 0.1;
const SPIN_RATE = (Math.PI * 2) / 24; /* one turn about its own axis per 24s */

/* ------------------------------------------------------------- layout --- */

const CAMERA_FOV = 42;
const CAMERA_DISTANCE = 9;

/* Halo orbit range measured radially off the helix axis. Kept tight so
   drifting particles hug the mark; the keep-out math below treats
   HALO_R_MIN + HALO_R_SPAN as the hard radial extent, so widening the halo
   automatically widens the computed offset. */
const HALO_R_MIN = 0.85;
const HALO_R_SPAN = 0.85;
/* Particles bob at most 0.3 past their base y (see Halo useFrame); 0.35
   bounds that with headroom. */
const HALO_Y_OVERSHOOT = 0.35;

/* Bounding-sphere radius of the whole composition around the group origin.
   Farthest content from the origin is a corner point: half the helix height
   (plus particle bob overshoot) along the axis, and the larger of the flared
   strand reach or the halo orbit radially. Tilt and spin are rotations about
   the origin, so a sphere bound is invariant to both. */
const HELIX_HALF_HEIGHT = HELIX_HEIGHT / 2;
const STRAND_MAX_RADIAL = HELIX_RADIUS * (1 + FLARE_AMOUNT) + TUBE_RADIUS;
const COMPOSITION_RADIUS = Math.hypot(
  HELIX_HALF_HEIGHT + HALO_Y_OVERSHOOT,
  Math.max(STRAND_MAX_RADIAL, HALO_R_MIN + HALO_R_SPAN),
);

/* Camera drift + pointer parallax (max ~0.85 world units of camera offset
   with a fixed look target) shifts points off the z=0 focal plane by at most
   0.85 * (COMPOSITION_RADIUS * scale) / CAMERA_DISTANCE ~= 0.18; 0.35 gives
   headroom for the drift extremes. */
const PARALLAX_MARGIN = 0.35;

const WIDE_MIN_WIDTH_PX = 1024;
/* On wide viewports the entire composition must stay right of this fraction
   of viewport width (the slices' left text column plus breathing room). */
const LEFT_KEEP_OUT = 0.52;
const WIDE_SCALE = 0.6;
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

/* ---------------------------------------------------------------- rungs --- */

const FIXED_RUNG_COUNT = 32;
const DRIFTER_COUNT = 3;
const RUNG_COUNT = FIXED_RUNG_COUNT + DRIFTER_COUNT;
const RUNG_RADIUS = 0.03;
/* Fixed rungs live only in the paired region; the flare zone above
   RUNG_T_MAX belongs to the free-floating drifters. */
const RUNG_T_MIN = 0.03;
const RUNG_T_MAX = 0.83;

interface RungData {
  baseColors: THREE.Color[];
  shimmerSpeed: Float32Array;
  drifterT: Float32Array;
  drifterPhase: Float32Array;
}

function buildRungs(colors: ThemeColors): RungData {
  const baseColors: THREE.Color[] = [];
  const shimmerSpeed = new Float32Array(RUNG_COUNT);
  for (let i = 0; i < RUNG_COUNT; i++) {
    /* Agents as base pairs: cycle the eight card hues. Damped well below
       full brightness plus per-rung variance so the ladder shimmers instead
       of reading as UI chrome. */
    baseColors.push(
      (colors.hues[i % HUE_COUNT] ?? colors.accent)
        .clone()
        .multiplyScalar(0.55 + Math.random() * 0.25),
    );
    shimmerSpeed[i] = 0.5 + Math.random() * 0.5;
  }
  const drifterT = new Float32Array(DRIFTER_COUNT);
  const drifterPhase = new Float32Array(DRIFTER_COUNT);
  for (let d = 0; d < DRIFTER_COUNT; d++) {
    drifterT[d] = 0.88 + d * 0.045;
    drifterPhase[d] = Math.random() * Math.PI * 2;
  }
  return { baseColors, shimmerSpeed, drifterT, drifterPhase };
}

function Rungs({ colors }: { colors: ThemeColors }): ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => buildRungs(colors), [colors]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const vA = useMemo(() => new THREE.Vector3(), []);
  const vB = useMemo(() => new THREE.Vector3(), []);
  const vDir = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tumbleAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const qTumble = useMemo(() => new THREE.Quaternion(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const time = useRef(Math.random() * 200);

  /* Fixed rung matrices are written exactly once here; per frame only the
     drifter matrices and the shimmer colors change. */
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < FIXED_RUNG_COUNT; i++) {
      const t =
        RUNG_T_MIN + (i / (FIXED_RUNG_COUNT - 1)) * (RUNG_T_MAX - RUNG_T_MIN);
      helixPoint(t, 0, vA);
      helixPoint(t, STRAND_PHASE_OFFSET, vB);
      dummy.position.copy(vA).add(vB).multiplyScalar(0.5);
      vDir.copy(vB).sub(vA);
      const len = vDir.length();
      dummy.quaternion.setFromUnitVectors(up, vDir.normalize());
      dummy.scale.set(RUNG_RADIUS, len, RUNG_RADIUS);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, tint.copy(data.baseColors[i] ?? colors.accent));
    }
    for (let d = 0; d < DRIFTER_COUNT; d++) {
      const idx = FIXED_RUNG_COUNT + d;
      mesh.setColorAt(idx, tint.copy(data.baseColors[idx] ?? colors.accent));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor.needsUpdate = true;
    }
  }, [colors, data, dummy, vA, vB, vDir, up, tint]);

  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    /* Clamp delta so resuming from a paused frameloop or a background tab
       nudges the animation instead of teleporting it. */
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    const t = time.current;

    /* Counter-shimmer: the brightness wave travels down the ladder (-i term)
       against the helix's spin direction. */
    for (let i = 0; i < RUNG_COUNT; i++) {
      const base = data.baseColors[i];
      if (!base) continue;
      const pulse =
        0.85 + 0.15 * Math.sin(t * (data.shimmerSpeed[i] ?? 0.7) - i * 0.55);
      mesh.setColorAt(i, tint.copy(base).multiplyScalar(pulse));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    /* Free rungs adrift between the unwound strand ends. */
    for (let d = 0; d < DRIFTER_COUNT; d++) {
      const idx = FIXED_RUNG_COUNT + d;
      const ph = data.drifterPhase[d] ?? 0;
      const tCurve =
        (data.drifterT[d] ?? 0.9) + Math.sin(t * 0.11 + ph) * 0.02;
      helixPoint(tCurve, 0, vA);
      helixPoint(tCurve, STRAND_PHASE_OFFSET, vB);
      const mix = 0.5 + 0.4 * Math.sin(t * 0.23 + ph * 3.1);
      dummy.position.lerpVectors(vA, vB, mix);
      dummy.position.y += Math.sin(t * 0.4 + ph) * 0.08;
      vDir.copy(vB).sub(vA);
      const len = vDir.length();
      dummy.quaternion.setFromUnitVectors(up, vDir.normalize());
      qTumble.setFromAxisAngle(tumbleAxis, t * 0.3 + ph);
      dummy.quaternion.multiply(qTumble);
      dummy.scale.set(
        RUNG_RADIUS,
        THREE.MathUtils.clamp(len * 0.45, 0.3, 0.65),
        RUNG_RADIUS,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, RUNG_COUNT]}
      /* Instances span the whole helix, far past the unit cylinder's own
         bounding sphere; culling by it would blink the ladder off. */
      frustumCulled={false}
    >
      {/* Unit cylinder, open-ended (caps invisible at 0.03 radius); every
          rung is this one geometry scaled to its chord. */}
      <cylinderGeometry args={[1, 1, 1, 6, 1, true]} />
      <meshBasicMaterial transparent opacity={0.9} depthWrite={false} />
    </instancedMesh>
  );
}

/* ----------------------------------------------------------------- halo --- */

const HALO_COUNT = 140;

interface HaloData {
  yBase: Float32Array;
  orbitR: Float32Array;
  orbitSpeed: Float32Array;
  phase: Float32Array;
  converge: Float32Array;
  baseScale: Float32Array;
}

function buildHalo(): HaloData {
  const yBase = new Float32Array(HALO_COUNT);
  const orbitR = new Float32Array(HALO_COUNT);
  const orbitSpeed = new Float32Array(HALO_COUNT);
  const phase = new Float32Array(HALO_COUNT);
  const converge = new Float32Array(HALO_COUNT);
  const baseScale = new Float32Array(HALO_COUNT);
  for (let i = 0; i < HALO_COUNT; i++) {
    yBase[i] = (Math.random() * 2 - 1) * HELIX_HALF_HEIGHT;
    /* Squared random biases the population toward the helix, leaving a thin
       outer fringe instead of a uniform shell. */
    orbitR[i] = HALO_R_MIN + Math.random() * Math.random() * HALO_R_SPAN;
    orbitSpeed[i] = (0.15 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1);
    phase[i] = Math.random() * Math.PI * 2;
    converge[i] = 0.35 + Math.random() * 0.6;
    baseScale[i] = 0.5 + Math.random() * 0.9;
  }
  return { yBase, orbitR, orbitSpeed, phase, converge, baseScale };
}

function Halo({ colors }: { colors: ThemeColors }): ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(buildHalo, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  /* Random start offset so every page load opens on a different pose. */
  const time = useRef(Math.random() * 200);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const tint = new THREE.Color();
    for (let i = 0; i < HALO_COUNT; i++) {
      /* 0.8 damps the hues so the halo reads as embers, not UI chrome,
         and never fights the light display text above it. */
      tint.copy(colors.hues[i % HUE_COUNT] ?? colors.accent).multiplyScalar(0.8);
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

    for (let i = 0; i < HALO_COUNT; i++) {
      const ph = data.phase[i] ?? 0;
      const a = ph + t * (data.orbitSpeed[i] ?? 0);
      /* Slow per-particle breath between the loose orbit and hugging the
         strands: the swarm reading the genome. */
      const breath = 0.5 + 0.5 * Math.sin(t * 0.07 + ph * 2.3);
      const r = THREE.MathUtils.lerp(
        data.orbitR[i] ?? 1,
        HELIX_RADIUS + 0.2,
        (data.converge[i] ?? 0.5) * breath,
      );

      dummy.position.set(
        Math.cos(a) * r,
        /* Bob amplitude 0.3 must stay under HALO_Y_OVERSHOOT (0.35), which
           is what the composition bound budgets for. */
        (data.yBase[i] ?? 0) + Math.sin(t * 0.25 + ph) * 0.3,
        Math.sin(a) * r,
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
      args={[undefined, undefined, HALO_COUNT]}
      /* Instances roam past the base geometry's bounding sphere; culling by
         it would blink the whole halo off at screen edges. */
      frustumCulled={false}
    >
      <octahedronGeometry args={[0.045, 0]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

/* -------------------------------------------------------- chimera mark --- */

function createFresnelMaterial(
  bg: THREE.Color,
  rim: THREE.Color,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      /* Core is bg pulled slightly toward the rim hue so the strand keeps a
         faint identity tint even face-on, still well under text luminance. */
      uBase: { value: bg.clone().lerp(rim, 0.18) },
      uRim: { value: rim.clone() },
    },
    vertexShader: /* glsl */ `
      varying float vFres;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vec3 v = normalize(-mvPosition.xyz);
        vFres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uRim;
      varying float vFres;
      void main() {
        gl_FragColor = vec4(mix(uBase, uRim, vFres), mix(0.2, 0.68, vFres));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

function ChimeraForm({ colors }: { colors: ThemeColors }): ReactElement {
  const spinRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * 200);
  const layout = useHeroLayout();

  /* Iris strand + amber strand: the signature pair braided together is the
     chimera statement, so each strand gets its own rim hue. */
  const strandAMaterial = useMemo(
    () => createFresnelMaterial(colors.bg, colors.accent),
    [colors],
  );
  const strandBMaterial = useMemo(
    () => createFresnelMaterial(colors.bg, colors.accent2),
    [colors],
  );
  /* <primitive> objects are not auto-disposed by R3F. */
  useEffect(() => () => strandAMaterial.dispose(), [strandAMaterial]);
  useEffect(() => () => strandBMaterial.dispose(), [strandBMaterial]);

  /* Curve objects are stable, so the TubeGeometries build exactly once and
     the strand centerlines are baked — nothing re-samples them per frame. */
  const curveA = useMemo(() => new HelixCurve(0), []);
  const curveB = useMemo(() => new HelixCurve(STRAND_PHASE_OFFSET), []);

  useFrame((_, rawDelta) => {
    const spin = spinRef.current;
    if (!spin) return;
    const dt = Math.min(rawDelta, 1 / 30);
    time.current += dt;
    /* Single group rotation animates every fixed rung and both strands. */
    spin.rotation.y = time.current * SPIN_RATE;
  });

  return (
    /* Position and scale come from computeLayout: on wide viewports the whole
       bounding sphere clears the left text keep-out; on narrow ones the mark
       centers behind the stacked text. */
    <group position={[layout.x, layout.y, 0]} scale={layout.scale}>
      {/* Static tilt: the helix axis leans ~20 deg in the screen plane. */}
      <group rotation={[AXIS_TILT_X, 0, AXIS_TILT_Z]}>
        {/* Spin group: the helix and its ladder turn about their own axis. */}
        <group ref={spinRef}>
          <mesh>
            <tubeGeometry args={[curveA, 220, TUBE_RADIUS, 10, false]} />
            <primitive object={strandAMaterial} attach="material" />
          </mesh>
          <mesh>
            <tubeGeometry args={[curveB, 220, TUBE_RADIUS, 10, false]} />
            <primitive object={strandBMaterial} attach="material" />
          </mesh>
          <Rungs colors={colors} />
        </group>
        {/* Halo drifts independently of the spin, around the tilted axis. */}
        <Halo colors={colors} />
      </group>
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
