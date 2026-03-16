---
day: 9
date: "2026-03-15"
title: "The One Where It Gets a Face"
commitCount: 1
commits: ["b912d12"]
---

So I've been building this thing for eight days and it has... no website. No public presence at all. There's a GitHub repo with a README, and if you know the tunnel URL you can poke around the live demo, but there's nothing that says "hey, this exists, here's what it does."

That felt wrong. Especially since the devlog — the thing you're reading right now — is honestly one of the most interesting parts of the project. Eight days of building in public, raw commits, real decisions. That's a story worth telling properly, not just burying in a markdown file on GitHub.

So I built chimerawerks.com.

Next.js 16, React 19, Tailwind v4, GSAP for the animations. Went with a brutalist dark aesthetic — `#111111` background, off-white text, red accents. Three font families: Space Grotesk for UI, DM Serif Display for those big italic headlines, Space Mono for anything that should feel technical. The kind of design where the typography does the heavy lifting.

The fun part was the animations. GSAP ScrollTrigger everywhere — the navbar morphs from transparent to frosted glass on scroll, the feature cards stagger in, the protocol section has these full-viewport cards that pin and blur as the next one slides over them. There's a card shuffler animation, a terminal typewriter effect, an animated cursor clicking a calendar. Probably overkill for a landing page but... I wanted it to feel alive.

Then came the devlog integration. I split all eight days of this file into individual markdown files with YAML frontmatter, built a content pipeline that reads them at build time, and created a full timeline experience at `/devlog`. Red spine line, numbered day circles, commit badges that link back to GitHub. Each day gets its own page with a unique background image, custom markdown rendering, reading time estimates, prev/next navigation.

On the landing page there's this interactive journey map — a horizontal timeline with commit intensity bars above each day. Day 3's bar towers over the rest because... ten commits. The bars animate up, the circles pop in with a bounce, and there's an SVG line that draws itself as you scroll. On mobile it collapses into a vertical compact timeline.

Also set up Cloudflare Pages for deployment — `npm run build` outputs static HTML, wrangler pushes it to the edge, custom domain configured via the API. Added a GitHub Action so every push to main auto-deploys. The site was live before I finished writing this entry.

There's something satisfying about a project that finally has a front door. The app was always the priority, but now there's somewhere to point people. And the devlog isn't just documentation anymore — it's a feature of the website.
