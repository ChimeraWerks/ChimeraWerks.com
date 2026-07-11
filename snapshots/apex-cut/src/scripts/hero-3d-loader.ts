// Mounts the R3F hero scene via dynamic import so three.js never loads unless
// the scene will actually render. Mount rules:
//   - ?hero=3d always mounts (comparison link, works on any slice).
//   - A slot carrying data-hero3d="default" mounts with no ?hero param, so the
//     helix is that page's default hero. Any explicit ?hero value other than
//     "3d" (shader, css) still suppresses it for side-by-side judging.
//   - data-hero3d="page" mounts the same way as "default" but in page mode:
//     the host is fixed to <body> and the helix travels with scroll (dir-c).
export async function maybeMountHero3D(): Promise<void> {
  const slot = document.getElementById("hero-canvas-slot");
  if (!slot) return;

  const pageMode = slot.dataset.hero3d === "page";
  const param = new URLSearchParams(location.search).get("hero");
  const isDefault =
    param === null && (slot.dataset.hero3d === "default" || pageMode);
  if (param !== "3d" && !isDefault) return;

  // Hero3D gates on these internally too, but by then the slot's CSS
  // decorations are already hidden and react + three are already downloaded.
  // Bail here so reduced-motion / no-WebGL visitors keep the CSS hero intact
  // and never pay for the bundles.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) return;
  } catch {
    return;
  }

  // Wait for the load event before fetching three.js: on the default path the
  // ~900KB chunk otherwise competes with fonts/CSS in the initial waterfall
  // and pushed measured LCP from 2.0s to 3.7s. The helix fading in a moment
  // after load is the intended behavior, not a compromise.
  if (document.readyState !== "complete") {
    await new Promise<void>((resolve) =>
      window.addEventListener("load", () => resolve(), { once: true }),
    );
  }
  await new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => resolve(), { timeout: 2000 });
    } else {
      setTimeout(resolve, 300);
    }
  });

  const [{ createElement }, { createRoot }, { default: Hero3D }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../components/Hero3D"),
  ]);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  // Page mode: the host is a fixed full-viewport layer on <body> (the Hero3D
  // container inside it carries the z-index), so the helix persists across
  // every chapter instead of scrolling away with the hero section.
  host.style.cssText = pageMode
    ? "position:fixed;inset:0;overflow:hidden;pointer-events:none;"
    : "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  // The slot's CSS decorations (arcane rings/veil) would double up behind the
  // 3D scene; hide them while the canvas owns the backdrop. The blueprint
  // grid on slice B lives on the slot itself, so it stays. The page-wide
  // smoke atmosphere canvas may still be parked in the slot at this point
  // (its script re-parents it to <body> on idle) — an inline visibility:hidden
  // would travel with it and kill the atmosphere for the whole page, so it is
  // exempt.
  for (const child of Array.from(slot.children)) {
    if (child.matches("canvas.hero-shader-canvas")) continue;
    (child as HTMLElement).style.visibility = "hidden";
  }
  (pageMode ? document.body : slot).appendChild(host);
  createRoot(host).render(
    createElement(Hero3D, pageMode ? { mode: "page" } : undefined),
  );
}

maybeMountHero3D();
