# ChimeraWerks.com — Agent Guide

Company landing page and devlog for Chimera Studio. Static Next.js site (`output: "export"`),
deployed to Cloudflare Pages. Canonical and owned.

## Build / test / run

```bash
npm install
npm run dev      # Next dev server (defaults to :3000; no port is set in config — see Ports below)
npm run build    # static export to out/ — this is what CI deploys; keep it green
npm run lint     # eslint (currently reports pre-existing content errors — see Scars)
npm test         # instruction-architecture gate (node scripts/check-agents-md.mjs)
```

Keep `npm run build` green for any change — CI deploys its `out/` on push to `main`.
`.github/workflows/deploy.yml` runs `npm ci && npm run build && wrangler pages deploy out`.

## Scars + hard rules

- **`npm run lint` exits non-zero today** on pre-existing content errors (`@next/next/no-html-link-for-pages`
  in Navbar/Footer/DevlogTeaser). The site intentionally uses raw `<a>` for the fixed nav and footer links,
  which the Next lint rule rejects. So the gate CANNOT hang off `lint`; it lives in a separate `npm test`.
  Check before assuming a red `lint` is your regression: `npm run lint` and diff against this known set.
- **Static export, no server at runtime.** `output: "export"` means every route is prerendered at build;
  there is no Node runtime in production. Anything relying on request-time server code (API routes, dynamic
  server rendering, middleware) silently no-ops in the deployed `out/`. Check: `npm run build` must succeed
  and `[day]` routes must appear under "SSG" in its output.

## Boundaries

- **Never touch deploy/auth config or secrets.** `.github/workflows/deploy.yml`, the Cloudflare Pages project
  name `chimerawerks-com`, GitHub secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`, and
  `~/.cloudflared/cert.pem` are load-bearing and out of scope for content or instruction edits.
- **A new devlog day touches three coupled locations or it deploys broken:** a new `day-N` markdown file under
  `content/devlog/` (with valid frontmatter), the `DAYS` array + `grid-cols-N` in
  `src/components/DevlogTeaser.tsx`, and a URL in `public/sitemap.xml`. Miss one and the teaser or sitemap
  silently drifts from the actual pages. Keep the sibling ChimeraStudio chronicle and devlog files in sync with
  the same entry.

## Ports

No port is set in `next.config.ts` or `package.json`, so `npm run dev` binds Next's default (`:3000`).
The chimera-ports registry assigns this app `20000`; read it from `PORT`/config, never hard-code it.
Registry + Caddy host: `CHIMERA-PORTS.md`. Subdomains/tunnels: `INFRASTRUCTURE.md`.

## Routing

- For instruction-file changes, read `docs/instruction-policy.md`.

## Maintaining this file

Update only on a trigger: a documented command failed as written; you changed a command, gate, flag, or port
named here; you lost real time to a recurring failure invisible in the code; you shipped a boundary no test
enforces. Full rules, tier ladder, and formats: `docs/instruction-policy.md`.
There is no hard length cap — the budget is the admission test; `node scripts/check-agents-md.mjs` hard-fails
only on dead routes and banned phrases, and warns past the review thresholds as an audit prompt, never a reason
to cram or drop a real scar.
A commit adding lines here names the failure it prevents.
