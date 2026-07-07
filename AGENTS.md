# ChimeraWerks.com — Agent Guide

Chimera Werks umbrella site: the ecosystem landing page (flagship Chimera Relay) plus the frozen
Chimera Studio era archive. Static Astro site, deployed to Cloudflare Pages. Canonical and owned.

## Build / test / run

```bash
npm install
npm run dev      # Astro dev server (defaults to :4321; no port is set in config — see Ports below)
npm run build    # astro build → out/ — this is what CI deploys; keep it green
npm run preview  # serves the built out/ (archive pages only work here, not in dev)
npm test         # instruction-architecture gate (node scripts/check-agents-md.mjs)
```

Keep `npm run build` green for any change — CI deploys its `out/` on push to `main`.
`.github/workflows/deploy.yml` runs `npm ci && npm run build && wrangler pages deploy out`.

## Scars + hard rules

- **`outDir: "out"` in `astro.config.mjs` is load-bearing.** The deploy workflow ships `out/` and must
  never be edited; Astro's default `dist/` would deploy nothing. Check: `npm run build` then `ls out/`.
- **Static output, no server at runtime.** Every route is prerendered; request-time server code silently
  no-ops in production.
- **Keep `@emnapi/core`/`@emnapi/runtime` pinned in devDependencies.** npm on Windows omits peer deps of
  not-installed optional wasm packages from the lock, which broke `npm ci` on the Linux deploy runner
  (2026-07). The devDep pins force hoisted lock entries. Check: the CI `npm ci` step is green.
- **Theme tokens are the only styling contract.** Components consume semantic tokens (`--bg`, `--ink-*`,
  `--accent*`, `--surface-*`) defined per `[data-theme]` in `src/styles/theme-*.css`; hard-coding a hex in
  a component breaks the other theme silently. Fontsource variable packages register names with a
  " Variable" suffix ("Archivo Variable") — see the coupling note in `src/styles/fonts.css`.

## Boundaries

- **Never touch deploy/auth config or secrets.** `.github/workflows/deploy.yml`, the Cloudflare Pages project
  name `chimerawerks-com`, GitHub secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`, and
  `~/.cloudflared/cert.pem` are load-bearing and out of scope for content or instruction edits. Sole
  precedented exception: the workflow's `node-version` may move when the toolchain demands it (bumped to 24
  for Astro 7 after the node-20 deploy failed, 2026-07).
- **`public/archive/v1/` is a frozen snapshot — never edit it in place.** It is the Chimera Studio era site
  built from tag `v1-chimera-studio` with `basePath: "/archive/v1"`; regenerate only from that tag (worktree,
  patch raw hrefs + CSS `url()` refs, rebuild, recopy). `.gitattributes` exempts it from EOL conversion to
  keep it byte-exact.
- **`public/_redirects` must ship in `out/`.** It preserves inbound `/devlog/*` and `/toolkit` links into the
  archive (301s). Cloudflare-only behavior: it cannot be tested locally, verify post-deploy with a curl.

## Ports

No port is set in config, so `npm run dev` binds Astro's default (`:4321`).
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
