# Snapshot: the "apex cut"

Frozen copy of the page served at `http://localhost:20000/rebuild/apex` as of
**2026-07-08**. Preserved on request so this direction survives further
iteration on other cuts (e.g. the low-poly `/rebuild/facet`).

## What it is

The **professional cut** — the "silicon valley professional" pass:

- Neutral cool near-black (`#0a0b0f`), one electric-indigo accent (`#7c74ff`)
  + a cyan counterpoint (`#45c6e0`). Theme id `apex`.
- Archivo (display) + Inter (body) + JetBrains Mono, sentence-case headlines,
  disciplined type scale, generous spacing.
- Hero: the real WebGL **DNA double-helix** (Hero3D, page mode) traveling on
  scroll behind the claim "Run a fleet of coding agents as one," retuned to
  the cool palette. Relay console + clean SVG diagrams below.
- No engraved plates, no mythology lore tags, no HUD frame/chapter counter —
  the deliberately restrained, product-forward version.

## Files (restore each back to the same path under `src/`)

| Snapshot path | Restore to | Role |
|---|---|---|
| `src/pages/rebuild/apex.astro` | `src/pages/rebuild/apex.astro` | the page |
| `src/styles/theme-apex.css` | `src/styles/theme-apex.css` | palette tokens (theme `apex`) |
| `src/styles/fonts.css` | `src/styles/fonts.css` | self-hosted font faces |
| `src/scripts/apex-motion.ts` | `src/scripts/apex-motion.ts` | GSAP/Lenis scroll motion |
| `src/scripts/hero-3d-loader.ts` | `src/scripts/hero-3d-loader.ts` | mounts the helix |
| `src/components/Hero3D.tsx` | `src/components/Hero3D.tsx` | the DNA-helix R3F scene |
| `src/components/HeroShader.astro` | `src/components/HeroShader.astro` | smoke atmosphere mount |
| `src/scripts/hero-shader.ts` | `src/scripts/hero-shader.ts` | smoke shader logic |
| `src/data/ecosystem.ts` | `src/data/ecosystem.ts` | the five werks |
| `src/data/themes.ts` | `src/data/themes.ts` | `THEME_CHANGE_EVENT` |

`rendered/apex.html` is the built HTML that was served (references hashed
`/_astro/*` chunks — a reference artifact, not standalone-runnable).

## Restore / run

The live route `src/pages/rebuild/apex.astro` is still in the repo today; this
snapshot is the insurance copy. To rebuild this exact version from the snapshot:

1. Copy the files above back to their `src/` paths (overwriting).
2. `npm run build` then `npm run preview` (binds :20000).
3. Visit `http://localhost:20000/rebuild/apex`.

The build is deterministic, so rebuilding from these sources reproduces exactly
what was on that URL.

## Note

Shared components (`Hero3D`, `HeroShader`, `hero-shader`, `ecosystem`,
`themes`, `fonts`) are also used by the live index and other cuts. They are
copied here as-of this date so the apex render is captured even if those files
change later for another direction.
