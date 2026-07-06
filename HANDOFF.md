---
goal: Run the local review of the rebuilt ChimeraWerks.com with the user - they pick an art direction (slice A vs B) and a hero (shader vs 3D) - then iterate on the winner and finish M5 (verify, merge, deploy, post-deploy checks).
next-focus: rebuild-review
repo: ChimeraWerks.com
branch: rebuild/umbrella-site
updated: 2026-07-06
---

# Goal
Run the local review of the rebuilt site with the user: pick art direction (slice A vs B) and hero (shader vs 3D), iterate on the winner, then finish M5 (verify, merge to main, deploy, post-deploy checks).

# Done
- Full plan (research + Codex adversarial cross-check) at C:\Users\charl\.claude\plans\starry-percolating-stonebraker.md; decisions mirrored in Claude project memory.
- Rebuild executed on branch rebuild/umbrella-site (9 commits, clean tree): Astro scaffold with outDir "out" (deploy pipeline untouched), Tailwind 4 + token layer.
- Two art-direction slices built: /dir-a (warm-arcane evolved, Relay-derived) and /dir-b (cool precision dark); index currently carries the latest "scientific-DNA" pass with helix hero as default.
- Both hero variants: OGL shader (default) and lazy R3F 3D behind ?hero=3d.
- Old Chimera Studio site frozen at public/archive/v1 with _redirects for /devlog/* and /toolkit; a11y audit fixes and privacy-page fix landed.
- AGENTS.md and package.json already updated on the branch for the Astro toolchain.

# Decisions
- Astro (latest major) over Next.js static export - converged independently by Claude research and a Codex adversarial consult (thread 019f2e9d-bea0-77b0-b535-46678ff73fac); do not relitigate.
- Deploy workflow (.github/workflows/deploy.yml) is never modified; build output stays out/.
- public/archive/v1 is frozen - regenerate only from git tag v1-chimera-studio, never hand-edit.
- Devlog does not carry forward; inbound /devlog/* links 301 to the archive.
- User picks direction and hero from rendered pages, not descriptions; losing variants get deleted after the pick.
- User communication: plain conversation and rendered results; avoid plan-mode style multiple-choice loops (explicit user feedback).

# Changed / important files
- src/pages/index.astro, dir-a.astro, dir-b.astro - the review surfaces (hero toggle via ?hero=3d)
- src/data/ecosystem.ts - drafted app roster (user has veto)
- public/archive/v1/ + public/_redirects - frozen archive + 301s
- astro.config.mjs - outDir "out", static output
- AGENTS.md - updated for Astro commands/scars on this branch

# Validation
- Branch builds committed through a11y + privacy fixes; working tree clean.
- NOT yet verified this session: fresh `npm run build`, local serve walkthrough, Lighthouse pass, and the user's own visual review - that review IS the next session's job.
- _redirects behavior is Cloudflare-only; verify post-deploy with a curl for a 301 on /devlog/day-19.

# Risks / open questions
- User has not approved any visual direction yet; nothing merges or deploys before their picks.
- The "scientific-DNA / helix hero" pass on index was a late iteration - confirm the user actually likes it vs the original slice A/B framing before deleting anything.
- Field CWV (p75) can only be checked post-deploy via PageSpeed/CrUX.

# Suggested skills
- /run or preview_start (registry port 20000; do not hard-code) for the local review
- verify skill for the pre-merge walkthrough; code-review before merging to main

# Next action
Start the dev/preview server, open /, /dir-a, /dir-b (each with and without ?hero=3d) plus /archive/v1/, and walk the user through them so they pick direction + hero.

# Artifact links
- Plan: C:\Users\charl\.claude\plans\starry-percolating-stonebraker.md
- Codex consult artifacts: C:\Users\charl\AppData\Local\Temp\claude\C--Github-ChimeraWerks-com\6b2f21e9-e22d-4ee8-8d08-a935732a4e88\scratchpad\codex-consult\
- Git tag v1-chimera-studio (old site); branch rebuild/umbrella-site
