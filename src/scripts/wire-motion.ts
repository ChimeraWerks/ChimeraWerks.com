/*
 * Motion specific to the "wire" cut, layered over apex-motion's base grammar
 * (which owns Lenis, the reveal hooks, and the progress line).
 *
 * One job: the failure-mode convergence. The wall of babysat terminals
 * drifts toward a single point and dims as the visitor scrolls through the
 * problem section, so "many terminals become one room" is enacted, not
 * illustrated.
 *
 * Gate: reduced-motion never runs this; the wall then reads as a static
 * before/after and stays complete.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initWire(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const wall = document.querySelector<HTMLElement>("[data-term-wall]");
  if (!wall) return;
  const terms = Array.from(wall.querySelectorAll<HTMLElement>(".term"));
  if (terms.length === 0) return;

  for (const term of terms) {
    /* Function-based values + invalidateOnRefresh: positions re-measure on
       every ScrollTrigger.refresh (the reflow scar - lazy images and font
       swaps shift layout after init, and cached deltas converge to the
       wrong point). */
    const delta = (axis: "x" | "y"): number => {
      const wallBox = wall.getBoundingClientRect();
      const box = term.getBoundingClientRect();
      const target =
        axis === "x"
          ? wallBox.left + wallBox.width / 2 - (box.left + box.width / 2)
          : wallBox.top + wallBox.height * 1.05 - (box.top + box.height / 2);
      return target * 0.82;
    };
    gsap.to(term, {
      x: () => delta("x"),
      y: () => delta("y"),
      scale: 0.55,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: wall,
        start: "clamp(top 45%)",
        end: "clamp(bottom 20%)",
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  }
}

initWire();
