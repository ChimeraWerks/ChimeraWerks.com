<p align="center">
  <img src="https://raw.githubusercontent.com/ChimeraWerks/ChimeraWerks/main/chimerawerks-logo.png" alt="Chimera Werks" width="240" />
</p>

<h1 align="center">chimerawerks.com</h1>

<p align="center">
  <strong>Landing page for <a href="https://www.chimerawerks.com">Chimera Werks</a> — AI-native tools for creators who generate at scale.</strong>
</p>

---

## Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP + ScrollTrigger
- **Icons**: Lucide React
- **Fonts**: Space Grotesk, DM Serif Display, Space Mono

## Development

```bash
npm install
npm run dev
```

## Build

Static export for deployment behind Cloudflare Tunnel:

```bash
npm run build    # outputs to out/
```

## Deployment

The site is served as a static export on port `20000` via the [Chimera Studio](https://github.com/ChimeraWerks/ChimeraStudio) stack, tunneled through Cloudflare to:

- **https://chimerawerks.com**
- **https://www.chimerawerks.com**

## Related

- [ChimeraWerks](https://github.com/ChimeraWerks/ChimeraWerks) — Organization profile
- [ChimeraStudio](https://github.com/ChimeraWerks/ChimeraStudio) — Flagship product: ComfyUI metadata extractor + searchable media browser
