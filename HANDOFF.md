---
goal: Continue the low-poly / spatial-VR "facet" redesign of ChimeraWerks.com. Get the user's verdict on the v1 facet cut (/rebuild/facet), then build Phase 2 - swap the abstract faceted core for the literal chimera (lion) head and add the three scripted facet-assembly moments - all on a dev branch and reviewed via the rebuild-preview alias, never touching production.
next-focus: facet-phase2
repo: ChimeraWerks.com
branch: rebuild/redesign-cuts
updated: 2026-07-08
---

# Goal
Continue the low-poly / spatial-VR "facet" redesign. First get the user's verdict on the rendered v1 (/rebuild/facet); if the direction lands, build Phase 2 (literal chimera head + the 3x facet-assembly moments + 3D diagram micro-scenes). Everything stays on the dev branch and is reviewed via the `rebuild-preview` Cloudflare alias - production is never touched during dev.

# Done
- Multi-cut redesign explored as separate `/rebuild/*` routes (prod untouched):
  - "flow cut" (restructured the live kinetic index) - user rejected the look, kept the pacing lesson.
  - clean/light + dark/stripped product-site variants (Daylight/Graphite) - user rejected both; deleted.
  - "apex" professional cut (`/rebuild/apex`, theme `apex`, cool indigo/cyan, DNA-helix hero) - user liked it; **snapshotted at `snapshots/apex-cut/`** with a MANIFEST + all deps.
  - **chosen direction: low-poly / spatial-VR "facet" cut** (`/rebuild/facet`).
- New brand mark: a faceted low-poly chimera (mark #3) generated via Chimera Image Lab, saved at `src/assets/marks/chimera-facet.png`. (Two rejected mark directions were monoline + helix-beast.)
- Facet v1 built to two ui-design agents' specs (design-system-architect = tokens/material/light-rig/glass/motion; ui-designer = composition thesis "many facets -> one form = many agents, one fleet"). Deployed to rebuild-preview.
- Cleaned up stale localhost servers: stopped my only one (`:20000` astro preview). Everything else on 200xx is the user's own Chimera stack (Relay x5, Browser, Lock, Memory) - left alone.

# Decisions
- Brand: **biology/science as the core, myth as one crafted mark** (not literal moody engraving). "Professional" for this user = the dark cinematic 3D world executed to studio craft, NOT a clean/light product site. See memory chimerawerks-professional-look.
- Palette held to cool indigo (`#7c74ff`) + cyan (`#45c6e0`) on near-black (`#0a0b0f`) - monochrome discipline is the guardrail against "crypto/rainbow" amateur read.
- v1 facet centerpiece is an ABSTRACT faceted crystal (proves engine + look). Phase 2 makes it the literal chimera head. Do not relitigate the low-poly VR direction without a new user steer.
- Reused (not rebuilt): the smoke atmosphere (HeroShader/hero-shader), apex-motion reveal system, Hero3D gate patterns. LowPolyHero is a separate component so apex/index still work.

# Changed / important files
- `src/pages/rebuild/facet.astro` - the spatial page (glass panels over the 3D world), theme `facet`.
- `src/components/LowPolyHero.tsx` - real R3F faceted core + shards + debris + light rig + scroll fade. The v1 centerpiece to upgrade in Phase 2.
- `src/scripts/facet-3d-loader.ts` - defers three.js past load (LCP), mounts LowPolyHero fixed behind content.
- `src/styles/theme-facet.css` - facet tokens (faceted ramps, glass, fog, motion) extending apex.
- `src/pages/rebuild/apex.astro` + `snapshots/apex-cut/` - the liked "professional cut" and its preserved copy.
- UNSHIPPED, do not push to main as-is: `src/pages/index.astro`, `src/scripts/kinetic.ts`, `src/styles/slice-arcane.css`, `src/styles/slice-kinetic.css` carry the rejected flow-cut edits to the LIVE homepage. Production still runs the original kinetic page from `main`.

# Validation
- `npm run build` green (5 pages). No mobile overflow on apex or facet (DOM-measured).
- Facet 3D VERIFIED rendering live in a foreground browser (Camoufox): faceted core in cool palette, scroll-fade to dim ambient behind content, glass panels legible. Deployed and 200 at the preview alias.
- NOT verified: the desktop-width composition (core offset right, headline in clear space) - Camoufox window is locked ~751px and Chrome pauses WebGL when backgrounded, so neither shows desktop + live 3D. View it at full width in a real foreground browser.

# Risks / open questions
- Scars carried into facet: (1) fixed alpha-WebGL canvas must stay z>=0 (Firefox inverts at negative z); (2) post-measure reflow strands scrubbed reveals - apex-motion queues a debounced ScrollTrigger.refresh; (3) CIL/codex image backend rejects transparent bg (generate on black).
- The abstract core may not read as "chimera" enough for the user - if so, pivot the centerpiece before building Phase 2 choreography.
- Werk cards still have no real URLs (unclickable) - the last gap vs a real product site; needs URLs from the user.
- Verification tooling: Camoufox screenshots crop + window locked narrow; Chrome won't shrink and pauses WebGL backgrounded. See memory visual-verification-paths.

# Suggested skills
- ui-design plugin agents (design-system-architect, ui-designer) - already seeded the facet specs; reuse for Phase 2.
- chimera-image-lab (`cil`) for the literal chimera head / assets in the faceted style (env: `cil` not on PATH, use the checkout venv at `C:\Github\Chimera-Image-Lab`; aspect-ratio control is loose).
- chimera-browser (Camoufox) for foreground 3D verification.

# Next action
Ask the user for their verdict on the rendered v1 facet cut (https://rebuild-preview.chimerawerks-com.pages.dev/rebuild/facet, viewed at desktop width). If yes: build Phase 2 - replace the abstract core in LowPolyHero.tsx with the literal chimera head (mark on shader-lit parallax planes per the composition brief's Phase 1 ramp, or a low-poly GLB) and add the hero facet-assembly + workflow triptych + contact converge. Spin the preview server back up only when actively building; deploy to rebuild-preview, never main.

# Artifact links
- Live prod (untouched): https://chimerawerks.com
- Review alias: https://rebuild-preview.chimerawerks-com.pages.dev  (/ = flow cut, /rebuild/apex = professional cut, /rebuild/facet = low-poly VR)
- Apex snapshot: snapshots/apex-cut/ (MANIFEST.md)
- Marks gallery artifact (3 logo directions): https://claude.ai/code/artifact/e135035d-fadc-4502-b60b-6701ee9f43d0
- Original rebuild plan: C:\Users\charl\.claude\plans\starry-percolating-stonebraker.md
