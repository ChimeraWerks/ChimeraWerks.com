---
goal: Iterate the live wire (hologram-bench) production site toward something the owner actually loves - bolder creative swings on the hero, motion, and section art within the brand rails - and close the open product gaps (outbound proof links, werk card URLs).
next-focus: wire-iteration
repo: ChimeraWerks.com
branch: rebuild/redesign-cuts
updated: 2026-07-11
---

# Goal
Iterate the live wire (hologram-bench) production site toward something the owner actually loves - bolder creative swings on the hero, motion, and section art within the brand rails - and close the open product gaps (outbound proof links, werk card URLs).

# Done
- Built the "wire" hologram-bench cut at `/rebuild/wire`: wireframe chimera beast as a live holographic projection (custom scanline/glitch shader, materialization sweep, emitter ring + light cone + rising dust) over the smoke world.
- Four content moments, all product claims verified against the Chimera-Relay repo (not memory): failure-mode terminal wall converging into the room console; native-harness roster (6 real adapters + transports) with 3 reasons native beats reimplemented; adapter-engine pipeline (real `AgentRuntimeAdapter` verbs) + real Chimera DNA script + preserved-trail beat; portability seams (HTTP/SSE, `chimera-dna` CLI, MCP tools, in-process `DnaRuntime`) with invented-but-credible use cases.
- Owner review round: replaced mesh-confetti particles (instanced octahedra, rejected as childish) with soft point-sprite dust, then tuned counts/sizes/alpha down from a firefly swarm to fine sparks.
- **PROMOTED TO PRODUCTION** (owner call): wire page is now `src/pages/index.astro`; branch merged to `main` (17c179b); CI deploy green; https://chimerawerks.com serves the wire cut; `/devlog/*` archive redirects verified live.
- Docs synced: DESIGN.md now describes the wire layer as shipped; AGENTS.md gained the dev-mode R3F scar.

# Decisions
- Wire cut ships "for now" - the owner said they still do not love the site. Iterate, do not defend the current design.
- Myth leads, engineering is the medium: the hologram wireframe beast is the hero creature; the faceted crystal gem stays the nav/brand mark.
- Particles must be soft point sprites (halo + hot core); mesh confetti is owner-rejected.
- "RL-tuned for their own harness" copy is our framing, not a Relay repo quote (repo evidence: transport decision in relay-dynamic-dna-design.md, subscription-first auth in AGENTS.md).
- Facet (`/rebuild/facet`) and apex remain live siblings for comparison; do not delete without a steer.
- The old never-touch-main rail was superseded ONLY for this promotion; future dev stays on branches + rebuild-preview until the owner says ship.

# Changed / important files
- `src/pages/index.astro` - the production wire page (promoted copy; root-relative imports, no noindex).
- `src/pages/rebuild/wire.astro` - dev sibling of the same page.
- `src/components/WireHero.tsx` - the hologram scene: HoloMark shader (scanlines/glitch/sweep, additive black-floor keying in-shader), EmitterBase, LightCone, ConeDust/DepthDust point sprites. WRAP_MAX must stay in sync with `.wrap`.
- `src/styles/theme-wire.css` - wire tokens, forked from facet, adds `--holo*`.
- `src/scripts/wire-3d-loader.ts` / `wire-motion.ts` - deferred 3D mount; terminal-wall convergence scrub (invalidateOnRefresh, reflow scar).
- `.claude/launch.json` - added `dev-host` / `preview-host` (Camoufox needs `--host` + LAN IP).

# Validation
- `npm run build` green (6 pages); impeccable detector clean on the new files; CI deploy succeeded.
- Live prod verified: 200, `data-theme="wire"`, WebGL beast rendering (Camoufox full-res screenshots), archive 301s intact.
- Verified narrow (~750px) and wide layouts via screenshots; NOT verified: intermediate breakpoints (820-1024px) and real mobile pixels (tooling can't reach them - see memory visual-verification-paths).
- Reduced-motion path (static mark + inert wall) implemented but not visually exercised this session.

# Risks / open questions
- Owner does not love the site; expect another creative round - possibly a different hero treatment, richer section art (image-gen authority granted: /chimera-image-gpt unlimited, CIL fallback), or stronger motion choreography.
- Open P1 from the critique snapshot (.impeccable/critique/): no outbound proof links (GitHub, live Relay). Werk cards still unclickable - needs owner URLs.
- R3F routes render NOTHING under `npm run dev` (react preamble error; loader falls back silently). Verify 3D on `npm run preview` only. (Now an AGENTS.md scar.)
- Claude Browser pane hung on every call this session; Camoufox (chimera-browser skill, LAN IP + evaluate route) carried all verification.
- og:image is the raw 3:2 wire webp on black - fine, but a composed og card would be better.

# Suggested skills
- impeccable (bolder/overdrive/animate for the next creative round), frontend-design
- chimera-browser (Camoufox verification recipe in memory visual-verification-paths)
- chimera-image-gpt / chimera-image-lab for section art and og card
- ui-design agents for a fresh composition critique

# Next action
Ask the owner what specifically falls flat (hero? copy? pacing? color?), then run an impeccable critique of the live index at desktop width and draft 2-3 bold variant directions as rendered slices on rebuild-preview.

# Artifact links
- Live prod: https://chimerawerks.com (wire cut)
- Review alias: https://rebuild-preview.chimerawerks-com.pages.dev (/rebuild/wire, /rebuild/facet, /rebuild/apex)
- Merge commit to main: 17c179b; promotion commit: ee2dccf
- Critique snapshot: .impeccable/critique/ (28/40, open P1 proof links)
