// Mounts the low-poly spatial hero (LowPolyHero) as a fixed full-viewport
// layer behind all content. Mirrors hero-3d-loader's discipline: three.js is
// dynamically imported only after `load` + idle, so the authored headline is
// the LCP element and the scene fades in a beat later (the deferral IS the
// design). Reduced-motion / no-WebGL bail before the bundle is fetched, so
// those visitors keep the flat authored page and the CSS/smoke ground.
export async function mountLowPolyHero(): Promise<void> {
  const slot = document.getElementById("hero-canvas-slot");
  if (!slot) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) return;
  } catch {
    return;
  }

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

  const [{ createElement }, { createRoot }, { default: LowPolyHero }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../components/LowPolyHero"),
  ]);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;inset:0;overflow:hidden;pointer-events:none;";
  // Hide the slot's own decorations (not the smoke canvas, which re-parents to
  // <body> on idle and must keep running for the whole page).
  for (const child of Array.from(slot.children)) {
    if (child.matches("canvas.hero-shader-canvas")) continue;
    (child as HTMLElement).style.visibility = "hidden";
  }
  document.body.appendChild(host);
  createRoot(host).render(createElement(LowPolyHero));
}

mountLowPolyHero();
