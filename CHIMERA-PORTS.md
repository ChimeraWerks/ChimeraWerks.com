<!-- Generated from the chimera-ports registry on 2026-06-20. Do not hand-edit; edit the registry and re-run `ports caddyfile`. -->
# Dev ports & Caddy hosts — chimerawerks-site

| App | Role | Port | Caddy host | Bind | Entry |
| --- | --- | --- | --- | --- | --- |
| chimerawerks-site | web | 20000 | [http://chimerawerks-site.chimera.localhost](http://chimerawerks-site.chimera.localhost) | `::` | next dev/start (static out/) |

## Rule

Read this port from an environment variable or config (e.g. `PORT`), defaulting to the registry value; never hard-code it. Before binding a new port, run `ports claim`.

## Hard-coded references to migrate

- [ ] README.md:38 — The site is served as a static export on port `20000` via the [Chimera Studio](https://github.com/ChimeraWerks/ChimeraStudio) stack, tunneled through Cloudflare to:

Browser → the Caddy host. Direct → http://localhost:20000. Source of truth → chimera-ports registry (block 20000-24999).
