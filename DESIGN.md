# Design

Visual system of the current chosen direction: the "facet" cut (`/rebuild/facet`, `[data-theme="facet"]`).
Source of truth for tokens is `src/styles/theme-facet.css`; this file describes intent so variants stay on brand.
The production index still runs the older kinetic cut; facet supersedes it once promoted.

## Concept

Low-poly / spatial-VR world: a real-time faceted chimera core and DNA ascent (two genome strands fusing upward into one mark) floating in smoke, with content on frosted-glass instrument panels above it.
Low-poly is the argument: many facets resolving into one form, many agents resolving into one fleet.
Color strategy: Committed. Electric indigo and cyan carry the world on a neutral near-black; the palette is user-approved brand identity, not a default.

## Colors

| Role | Token | Value |
|---|---|---|
| Background | `--bg` | `#0a0b0f` near-black, neutral |
| Surfaces | `--surface-1..3` | `#10121a` / `#161923` / `#1d212c` |
| Lines | `--line-1/2` | `#222633` / `#2e3341` |
| Ink | `--ink-1/2/3` | `#f1f3f6` / `#a4a9b4` / `#7e8390` (ink-3 floor: 4.9:1 on surface-1, do not darken) |
| Accent (indigo) | `--accent`, `--accent-hi`, `--accent-dim` | `#7c74ff` / `#9a93ff` / `#1a1930` |
| Accent 2 (cyan) | `--accent-2`, `--accent-2-hi`, `--accent-2-dim` | `#45c6e0` / `#78d9ee` / `#0f2730` |
| Semantic | `--good` / `--warn` / `--bad` | `#46c98a` / `#d7ab4e` / `#e86d78` |
| Facet geometry | `--facet-violet/indigo/cyan`, `--facet-hi/mid/lo/shadow` | flat-shaded 3D ramp; the WebGL scene reads these off `<html>` |
| Emissive/rim | `--emissive-core`, `--rim`, `--rim-2` | 3D rim lighting |
| Card hues | `--card-hue-0..7` | cool jewel ramp for werk-card spines |

Rules: components consume semantic tokens only; a hard-coded hex breaks the theme contract.
Glow is permitted as brand voice but only on accents, semantics, and interactive emphasis, never on body text.

## Typography

| Role | Stack | Notes |
|---|---|---|
| Display | "Archivo Variable" | headings, brand; weights 620-680; tight tracking, floor -0.038em |
| Body | "Inter Variable" | committed identity choice (predates reflex-reject lists); line-height 1.55 |
| Mono | "JetBrains Mono Variable" | instrument/console voice: labels, runlines, specs, captions |

Fontsource registers names with a " Variable" suffix; theme files must reference them exactly (coupling note in `src/styles/fonts.css`).
Scale (fluid clamp): display `2.6-5.2rem`, statement `2.2-4rem`, section `1.9-3rem`; sentence case everywhere, uppercase reserved for short mono labels.
Hero lockup is an explicit 3-line block-span taper (balance froze ragged under SplitText); body measure capped (lede 40ch, subs 52-54ch, card blurbs 62ch).
Kicker system: ONE tracked-caps eyebrow (hero only, approved); section tags speak lowercase mono with a glowing dot; repeating the tracked eyebrow per section is banned AI grammar.

## Surfaces & Components

- **Panel** (`.panel`): the glass primitive. `--panel-bg` frosted fill, 18px blur + saturate(1.3), 1px `--panel-border`, 16px radius, inner highlight + deep shadow. Hover: border-hi + indigo glow.
- **Nav**: fixed, solid-glass (`--panel-bg-solid`, 28px blur), hairline bottom border; brand mark is a CSS clip-path facet gem.
- **Werk grid**: 3-column glass slabs, flagship spans 2; per-card hue rides a faceted gem (the brand pentagon) before each title and tints the hover border. No side-stripe spines: that is the AI card template and is banned.
- **Console**: literal Relay product UI (title bar, lanes, gauges, judge-panel footer), tilted `rotateY(-6deg)` in space; it breathes (pulsing live dot, active-lane gauge sweep) because the argument is "live".
- **Beats**: alternating copy-panel + figure-panel rows; figures are hand-authored token-colored SVG diagrams, mono-labeled.
- **Progress**: single 2px hairline scroll-progress line, indigo-to-cyan. This is the entire HUD; no chapter counters or frames.

## Layout

- Wrap: `min(1360px, 94vw)`, fluid padding `clamp(20px, 4vw, 40px)`; keep in sync with `WRAP_MAX` in `LowPolyHero.tsx` (the 3D subject anchors to this column).
- Hero: full-viewport (`100dvh`), copy left in a soft radial legibility pocket, 3D subject offset right.
- Section rhythm: fluid `clamp()` paddings (statement 80-170px, sections 64-120px); vary density deliberately (bare-type statement vs dense instrument sections).
- Z scale: world canvases 0, vignette/main 1, nav 50, progress 60.

## Motion

- Grammar: spatial ease `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out family), durations 160/320/620ms.
- Page motion via `apex-motion.ts` reveal hooks (`data-hero-rise`, `data-reveal`, `data-reveal-title`); reveals enhance already-visible content, never gate it.
- The 3D world (three.js, deferred past load for LCP) is the primary motion statement: living idle, pointer parallax with heavy lerp, DNA ascent.
- Reduced motion: all canvases gate off; the static faceted-mark image is the mandatory brand fallback.
- WebGL failure (probe fail, bundle fetch fail, context error) sets `html.facet-3d-off`, which also shows the static mark: the beast moment must never silently vanish.

## Myth identity layer

Owner decision (2026-07-09): the myth layer is expanded beyond the single mark, in the faceted register only.
The three heads appear individually (goat=Codex violet, lion=Claude indigo, serpent=Gemini cyan) with harness aliases, e.g. the workflow strands row.
Execution rules: crystal-facet style matched to the mark (CIL, style-referenced), real alpha (black-floor keyed offline; mix-blend-mode cannot reach the world canvases from inside main's stacking context), sentence-case naming.
Still banned: engraved AI plates, lore-tag theater ("the specimen"), occult vocabulary, myth-as-mechanic copy.

## Assets

- The myth mark: `src/assets/marks/chimera-facet.png/.webp` (faceted three-headed chimera).
- Per-head renders: `src/assets/marks/head-goat/-lion/-serpent.png` (alpha-keyed, CIL-generated in the mark's style).
- Smoke atmosphere: `HeroShader.astro`; faceted core + DNA ascent: `LowPolyHero.tsx`.
- Ecosystem roster and card copy: `src/data/ecosystem.ts`.
