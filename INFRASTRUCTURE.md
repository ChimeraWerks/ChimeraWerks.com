# ChimeraWerks Infrastructure

All subdomains, services, and hosted projects on chimerawerks.com.

## Active Subdomains

| Subdomain | Project | Type | Method | Local Port | Description | Dependencies |
|-----------|---------|------|--------|------------|-------------|--------------|
| chimerawerks.com | ChimeraWerks.com | Static site | Cloudflare Pages | — | Company landing page and devlog | — |
| cyberpunk.chimerawerks.com | cyberpunk-chimerawerks | Static site | Cloudflare Pages | — | Cyberpunk TCG investment tracker | — |
| cli.chimerawerks.com | ChimeraCLI | Backend service | Cloudflare Tunnel | 20230 | Web-based multi-window Claude Code terminal | Glances (22200) |

## Tunnels

| Tunnel Name | Tunnel ID | Subdomain | Status |
|-------------|-----------|-----------|--------|
| chimera-cli | e5df86ed-bb2d-4834-b720-a6dbadf8ac7e | cli.chimerawerks.com | Active |
| chimera-studio | db305ef1-4557-44c9-b927-eef2b1b95ac7 | — | Active (no public DNS) |

## Port Registry

| Port | Service | Notes |
|------|---------|-------|
| 20100 | Chimera Studio (Vite frontend) | Dev server |
| 21100 | Chimera Studio (FastAPI backend) | API + WebSocket |
| 20230 | Chimera CLI Portal | API + WebSocket + terminal PTY |
| 22200 | Glances | System monitoring dashboard |

## Notes

- Tunnels run via `cloudflared` on the local machine — services must be running for subdomains to work
- Pages sites deploy automatically on push to main via GitHub Actions
- All tunnel services require both the server process AND the `cloudflared tunnel run` process
- Auth cert: `C:\Users\charl\.cloudflared\cert.pem` — never regenerate
- Pages deploy uses GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` — never touch
