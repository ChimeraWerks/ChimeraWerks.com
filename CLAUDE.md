# ChimeraWerks.com

Company landing page and devlog for Chimera Studio. Static site deployed to Cloudflare Pages.

## Stack

- **Framework**: Next.js 16.1.6, React 19, TypeScript
- **Styling**: Tailwind CSS v4, GSAP 3.14 (ScrollTrigger)
- **Fonts**: Space Grotesk (sans), DM Serif Display (serif), Space Mono (mono)
- **Content**: gray-matter (frontmatter parsing), custom markdown-to-HTML renderer
- **Deploy**: Cloudflare Pages via GitHub Actions on push to main

## Design System — "Brutalist Signal"

- Background: `#111111` (--color-foreground)
- Text: `#E8E4DD` (--color-primary)
- Accent: `#E63B2E` (--color-accent)
- Cards: `brutalist-card-dark` class (subtle rgba borders, 2rem radius)
- Buttons: `btn-magnetic` class (sliding ::before hover effect)
- All sections use atmospheric background images at low opacity with `mix-blend-screen`

## Run

```bash
npm run dev      # Dev server on port 22001
npm run build    # Static export to out/
```

## Deploy

Push to `main` → GitHub Actions runs `npm run build` → `wrangler pages deploy out` → live on chimerawerks.com

- **Workflow**: `.github/workflows/deploy.yml`
- **Secrets**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (set in GitHub repo settings)
- **Pages project**: `chimerawerks-com`
- **Domains**: `chimerawerks.com`, `www.chimerawerks.com`, `chimerawerks-com.pages.dev`

## Structure

```
src/app/
  page.tsx              Landing page (hero, philosophy, features, architecture, protocol, CTA, devlog teaser)
  layout.tsx            Shared layout (Navbar + Footer + fonts + SEO metadata)
  globals.css           Theme, component classes, nav-scrolled styles, devlog typography
  devlog/
    page.tsx            Devlog timeline index
    DevlogTimeline.tsx  Client component with GSAP animations
    [day]/
      page.tsx          Individual day page (SSG via generateStaticParams)
      DevlogContent.tsx Client component — custom markdown-to-HTML renderer
  privacy/
    page.tsx            Privacy policy
src/components/
  Navbar.tsx            Fixed nav with GSAP scroll morph
  Footer.tsx            Footer with real links (GitHub, Releases, License, Privacy, Devlog)
  DevlogTeaser.tsx      "Building in Public" journey map on landing page
  CommitBadge.tsx       Commit hash pill linking to GitHub
src/lib/
  devlog.ts             Content pipeline — reads content/devlog/*.md, parses frontmatter
content/devlog/
  day-1.md ... day-9.md Devlog entries with YAML frontmatter
public/
  images/               Background images (hero, texture, features_bg, arch_bg, protocol_1-3_bg)
  robots.txt
  sitemap.xml
```

## Adding a New Devlog Entry

1. Create `content/devlog/day-N.md`:
   ```yaml
   ---
   day: N
   date: "YYYY-MM-DD"
   title: "Entry Title"
   commitCount: X
   commits: ["hash1", "hash2"]
   ---
   Markdown content here...
   ```

2. Add the day to the `DAYS` array in `src/components/DevlogTeaser.tsx` and bump `grid-cols-N`

3. Add the URL to `public/sitemap.xml`

4. Push to main — auto-deploys in ~60 seconds

## Key Patterns

- **Static export**: `output: "export"` in `next.config.ts` — all routes pre-rendered at build time
- **Dynamic routes**: `[day]` uses `generateStaticParams()` from `src/lib/devlog.ts`
- **Shared layout**: Navbar and Footer live in `layout.tsx`, not per-page
- **GSAP animations**: Each animated component manages its own `gsap.context()` and cleans up on unmount
- **Nav scroll morph**: `.nav-scrolled` class toggled by GSAP ScrollTrigger, styled in `globals.css`
- **Background images**: Used as CSS `background-image` at low opacity with `mix-blend-screen` overlay
- **Devlog content**: Markdown rendered via custom `markdownToHtml()` in `DevlogContent.tsx` — handles bold, italic, code, links, lists, headings. Styled via `.devlog-prose` class in `globals.css`

## Related Repos

- **ChimeraStudio** (`c:\Github\ChimeraStudio`): The product. Backend + frontend app. Has its own `CHRONICLE.md` and `DEVLOG.md` that should be updated alongside the website devlog entries.
- When adding devlog entries, update all three locations: website `content/devlog/`, ChimeraStudio `CHRONICLE.md`, ChimeraStudio `DEVLOG.md`

## Conventions

- Port: 22001 (following ChimeraWerks `2XYZZ` scheme)
- Mailto links always include `?subject=Chimera%20Studio%20Beta%20Access%20Request`
- Footer links must point to real destinations (no `href="#"` placeholders)
- No inline `<style>` blocks — all CSS goes in `globals.css`
- Commit links use format: `https://github.com/ChimeraWerks/ChimeraStudio/commit/{hash}`
