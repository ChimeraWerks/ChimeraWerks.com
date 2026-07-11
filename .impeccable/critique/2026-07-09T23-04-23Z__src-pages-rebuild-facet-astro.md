---
target: /rebuild/facet (facet cut)
total_score: 28
p0_count: 0
p1_count: 3
timestamp: 2026-07-09T23-04-23Z
slug: src-pages-rebuild-facet-astro
---
# Critique: /rebuild/facet (facet cut)

Method: dual-agent (A: design review sub-agent · B: detector/browser-evidence sub-agent).
Note: pixel screenshots unavailable this run (preview pane timeout); A used measured geometry + a11y snapshot + source; B ran the in-page detector overlay successfully.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | progress hairline, live badges, gauges; no cue if 3D never arrives |
| 2 | Match System / Real World | 4 | practitioner language throughout (stderr, exit codes, diffable) |
| 3 | User Control and Freedom | 3 | Lenis scroll-hijack taxes control; anchors work |
| 4 | Consistency and Standards | 3 | token discipline excellent; "swarm" copy contradicts one-organism register |
| 5 | Error Prevention | 3 | mailto-only surface, little to break |
| 6 | Recognition Rather Than Recall | 3 | "Werks" nav label is jargon pre-scroll |
| 7 | Flexibility and Efficiency | 3 | reduced-motion path exists; no skip link |
| 8 | Aesthetic and Minimalist Design | 3 | coherent; werks-to-beats stretch is densest |
| 9 | Error Recovery | 2 | WebGL failure erases the brand mark, no fallback (static mark is reduced-motion-only) |
| 10 | Help and Documentation | 1 | zero outbound artifacts: no repo, docs, or demo link |
| **Total** | | **28/40** | Good |

## Anti-Patterns Verdict

Mostly clean; a senior engineer would not immediately say "AI made this," but three template residues survive:
- Side-stripe card borders: `.werk::before` 2px glowing left spine on every card (facet.astro:665). The loudest tell; the skill's absolute ban.
- Repeated tracked-caps kickers: `.tag` on all 4 sections + hero eyebrow = 5 (detector overlay counted 4 repeated-section-kickers; hero one is approved brand).
- Numbered markers 01/02/03 on the beats (facet.astro:33-49); the beats are parallel arguments, not a sequence.

Deterministic scan: CLI 3 findings (2 em-dash hits are comment-only false positives; numbered markers real). Overlay: 27 findings, 18 known-approved noise (ai-color-palette/dark-glow/hero-eyebrow-chip), 12 actionable: cramped-padding (btn-ghost 0px vertical), wide-tracking x4 (runline + figcaptions 0.06em), tiny-text x3 (10.5px SVG labels), repeated-section-kickers x4.

## Priority Issues

- [P1] Hero headline renders as a ragged 3-line stack at all desktop widths: forced `<br/>` assumes "Run a fleet of coding" fits one line; it never does at clamp max in 680px copy column. Also yields "codingagents" in the a11y tree/clipboard. Fix: remove the br, let text-wrap balance break it; retune copy column. (/impeccable polish)
- [P1] "swarm" violates the brand's banned vocabulary twice: facet.astro:181 "Where the swarm reports for duty." and ecosystem.ts:24 "One console for the whole swarm." Fix: fleet. (/impeccable clarify)
- [P1] No verifiable artifact for the skeptical engineer: no repo/docs/demo link anywhere; only scroll and mailto. USER DECISION needed on which artifact is public/presentable. (/impeccable harden)
- [P2] WebGL failure erases the beast moment: error boundary renders null; static mark shows only under prefers-reduced-motion. Fix: show static mark whenever 3D fails or never mounts. (/impeccable harden)
- [P2] Werk-card hue spine is the last card-template tell; by the brand's own principle it argues nothing. Fix: replace with a faceted gem marker or cut. (/impeccable polish)

## Persona Red Flags

- Jordan (first-timer): "Werks" label meaningless pre-scroll; nothing to try, only email; "Meet Chimera Relay" scrolls, doesn't go anywhere.
- Riley (stress tester): reduced-motion static mark (0.55 opacity) sits behind the bare-type statement section, legibility risk; WebGL-fail path has no brand visual; "codingagents" textContent bug.
- Casey (mobile): three.js ships to phones for a background scene (deferred but full bundle + continuous frameloop, no save-data gate); nav links ~21px tall (sub-44px targets); no contact affordance <700px until page bottom.
- Skeptical staff engineer: error-trail beat + DNA spec figure are the credibility peaks; gap is nothing verifiable to click.

## Cognitive Load

1 hard failure (werk grid = 6 cards in one scan group), 1 marginal (hero h1 ragged stack undermines the top of the hierarchy). Rest pass.

## Emotional Journey

Peak: beat 03's preserved error trail (`stderr: ENOENT ./harness (preserved)`); the moment a skeptic believes. End is strong ("a human answers" + oversized mail link) but emotionally only; no artifact converts belief to action. Valley: werks grid stretch.

## Strengths

1. Beat 03's error-trail figure: no competitor page shows its failure path; exactly right for this audience.
2. The x/arrow bad-good beat grammar: self-contained failure-vs-fix pairs in honest practitioner copy.
3. Token + scar-comment discipline: the craft argument the brand makes is visible in the source itself.

## Minor Observations

- Tiny-text cluster: 10.5px SVG labels, 0.64-0.68rem mono captions.
- Dead #contact anchor: nothing links to it (nav CTA and hero ghost are both mailto).
- No OG/twitter meta yet (fine while noindex; required before promotion).
- Hard-coded #0a0b0f in .btn-primary color + rgba accent glows (theme-contract nit).
- ecosystem.ts relay blurb uses em-dash cadence with plain dashes.

## Questions to Consider

1. Where does the skeptic go after believing? Zero outbound proof links: statement or gap?
2. What does the 8-hue jewel spine argue? If nothing, it's the one place the page still looks like everyone else's card grid.
3. Should the static mark be the first frame for everyone, upgraded by 3D, rather than a reduced-motion-only fallback?
