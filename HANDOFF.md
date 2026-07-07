---
goal: Redesign ChimeraWerks.com (now live on main) with a fresh creative eye so it flows like a top-tier Silicon Valley product site, not a talented amateur's page - use the ui-design plugin agents and real knowledge of the Chimera app suite, and freely change, delete, or add anything.
next-focus: creative-redesign
repo: ChimeraWerks.com
branch: main
updated: 2026-07-06
---

# Goal
Redesign the live site with a fresh creative eye so it flows like a top-tier Silicon Valley product site. The user's exact verdict on the current version: "a really smart kid made it look good, but it doesn't really flow well or feel like a silicon valley project." Free rein: change, delete, add - use the ui-design plugin agents (ui-designer, design-system-architect, interaction-design, visual-design-foundations) and knowledge of the Chimera app suite (Relay, DNA, Library, Browser, Image Lab - see src/data/ecosystem.ts and the chimera-* skills).

# Done
- "Kinetic cut" built and shipped as the landing page (promoted from /dir-c; slices A/B deleted): Lenis smooth scroll + GSAP ScrollTrigger/SplitText, boot loader, HUD chapter counter, page-fixed 3D helix traveling through 5 chapters, three orbiting agent cores (amber=lion=Claude, teal=goat=Codex, blue=serpent=Gemini), 170-mote drift field, engraved asset set (3 specimen plates, 6 card emblems, 2 backdrops) generated via /imagelab in the chimera-plate style.
- Live theme picker on every page (bottom-right): swaps [data-theme] tokens live, re-colors the WebGL layers via the chimera:themechange event. Registry: src/data/themes.ts.
- Old Chimera Studio site archived at /archive/v1 with /devlog/* 301s (public/_redirects).
- Merged to main and pushed; CI deploys out/ to Cloudflare Pages.

# Decisions
- Astro static + outDir "out"; deploy workflow untouched (standing rule, see AGENTS.md).
- Kinetic cut IS the site now; A/B slices deleted, their token themes (arcane/precision) kept for the picker.
- Animal aliases stay subtle: lion=Claude, goat=Codex, serpent=Gemini, stated in plate microtags only.
- Copy leads with agentic workflows (rooms, judge panels, handoffs), not mythology - explicit user direction.
- The KPR motion grammar (lerped scroll, scrubbed reversible reveals, loader handoff, persistent HUD) was user-approved as "pretty good" - evolve it, don't blindly discard, but the redesign has explicit permission to change anything that serves flow.

# Changed / important files
- src/pages/index.astro - the kinetic landing page (5 chapters)
- src/scripts/kinetic.ts - all motion orchestration; note the reflow-refresh block at the end (scar)
- src/components/Hero3D.tsx - helix + page mode + agent moons + drift field; Firefox negative-z scar comment
- src/components/ThemePicker.astro, src/data/themes.ts - live theming
- src/styles/slice-kinetic.css + slice-arcane.css - kinetic layout + reused chrome (boundary documented in kinetic css header)
- src/assets/kinetic/ - generated engraved assets

# Validation
- npm run build green; npm test (AGENTS.md gate) passes.
- Full-scroll walkthroughs in Camoufox in both themes, including theme-switch-at-page-bottom (the reflow bug repro) - all pass locally.
- Production VERIFIED live: https://chimerawerks.com serves the kinetic cut (title "Many agents, one beast"), /devlog/day-19 301s to /archive/v1/devlog/day-19, /archive/v1/ returns 200.
- CI required two fixes to go green: node 24 in deploy.yml (Astro 7 engines) and @emnapi devDep pins (Windows npm drops optional-wasm peer deps from the lock). Both documented in AGENTS.md.
- Field CWV (p75) still only checkable via PageSpeed/CrUX after traffic accrues.

# Risks / open questions
- Three scars that will bite a redesign: (1) fixed alpha-WebGL canvas at negative z-index inverts colors in Firefox - keep canvas z>=0 with content lifted above; (2) any post-measure reflow (lazy images, theme/font swap) strands scrubbed reveals - kinetic.ts already queues ScrollTrigger.refresh for known sources, add new sources to it; (3) codex-oauth image backend rejects transparent backgrounds - generate on black + mix-blend-mode: screen.
- The user reviews rendered results, not descriptions (see memory: milestone-first-visual-slices) - build, deploy to the rebuild-preview branch alias, then present URLs.
- Do not touch .github/workflows/deploy.yml, public/archive/v1/, or public/_redirects (AGENTS.md boundaries).

# Suggested skills
- ui-design plugin agents: ui-designer, design-system-architect, interaction-design, visual-design-foundations (the brief names them)
- /imagelab for more assets in the established engraved style (prompt style anchor: src/assets/chimera-plate.png)
- chimera-browser for real-browser visual verification; wrangler pages deploy out --branch rebuild-preview for review deploys
- frontend-design skill for aesthetic direction

# Next action
Do a structured critique pass of the live site (https://chimerawerks.com) against 3-5 best-in-class Silicon Valley product sites (Linear, Vercel, Stripe tier) to name concretely what "doesn't flow" - then redesign from that critique, not from scratch.

# Artifact links
- Live: https://chimerawerks.com · review alias: https://rebuild-preview.chimerawerks-com.pages.dev
- Plan (original rebuild): C:\Users\charl\.claude\plans\starry-percolating-stonebraker.md
- KPR study screenshots + generated asset masters: session scratchpad (temp, may be gone)
- Git tag v1-chimera-studio = archived old site source
