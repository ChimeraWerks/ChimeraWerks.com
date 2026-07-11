// Mounts the hologram hero (WireHero) as a fixed full-viewport layer behind
// all content. Mirrors facet-3d-loader's discipline: three.js is dynamically
// imported only after `load` + idle, so the authored headline is the LCP
// element and the scene fades in a beat later (the deferral IS the design).
// Reduced-motion / no-WebGL bail before the bundle is fetched, so those
// visitors keep the flat authored page and the CSS/smoke ground.
/* Signals CSS (html.facet-3d-off shows .static-mark - the repo-wide "3D layer
   off" class) that the layer will never render, so a WebGL-less visitor still
   gets the brand mark instead of bare smoke. Reduced-motion is NOT signalled
   here: its media query already shows the mark, and it must keep working
   without JS. */
export function signalWire3dOff(): void {
  document.documentElement.classList.add("facet-3d-off");
}

export async function mountWireHero(): Promise<void> {
  const slot = document.getElementById("hero-canvas-slot");
  if (!slot) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) {
      signalWire3dOff();
      return;
    }
  } catch {
    signalWire3dOff();
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

  let modules;
  try {
    modules = await Promise.all([
      import("react"),
      import("react-dom/client"),
      import("../components/WireHero"),
    ]);
  } catch {
    // Bundle fetch failed (offline mid-visit, CDN hiccup): fall back to the
    // static mark rather than a markless page.
    signalWire3dOff();
    return;
  }
  const [{ createElement }, { createRoot }, { default: WireHero }] = modules;

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
  createRoot(host).render(createElement(WireHero));
}

mountWireHero();
