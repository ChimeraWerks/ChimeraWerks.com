// Demo scaffolding for the hero pick: mounts the R3F scene only when the
// page is opened with ?hero=3d, via dynamic import so three.js never loads
// otherwise. Replaced by a plain Astro island once the owner picks a hero.
export async function maybeMountHero3D(): Promise<void> {
  if (new URLSearchParams(location.search).get("hero") !== "3d") return;
  const slot = document.getElementById("hero-canvas-slot");
  if (!slot) return;

  const [{ createElement }, { createRoot }, { default: Hero3D }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../components/Hero3D"),
  ]);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  // The slot's CSS decorations (arcane rings/veil) would double up behind the
  // 3D scene; hide them while the canvas owns the backdrop. The blueprint
  // grid on slice B lives on the slot itself, so it stays.
  for (const child of Array.from(slot.children)) {
    (child as HTMLElement).style.visibility = "hidden";
  }
  slot.appendChild(host);
  createRoot(host).render(createElement(Hero3D));
}

maybeMountHero3D();
