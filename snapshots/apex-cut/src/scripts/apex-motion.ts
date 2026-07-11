/*
 * Motion for the "apex" cut — the professional evolution of the kinetic
 * grammar. Same bones the owner approved (lerped smooth scroll, scrubbed
 * reversible reveals, masked type), but restrained: no boot loader, no HUD
 * frame/chapter-counter theater, one hairline scroll-progress line, and
 * easing tuned for calm rather than spectacle.
 *
 * Gate: reduced-motion never runs this, so every pre-hidden/JS-owned state
 * stays inert and the page reads complete and static.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import { THEME_CHANGE_EVENT } from "../data/themes";

export function initApex(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add("apex-motion");

  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector<HTMLElement>(anchor.getAttribute("href") ?? "");
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.2 });
    });
  }

  heroRise();
  reveals();
  progress();

  /* Reflow scar (carried from the kinetic cut): any layout shift AFTER the
     triggers measure — lazy images landing, a theme/font swap — strands every
     trigger below it with stale positions. One debounced refresh covers all
     three sources. */
  let refreshTimer = 0;
  const queueRefresh = (): void => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  for (const img of document.querySelectorAll<HTMLImageElement>("img[loading='lazy']")) {
    if (img.complete) continue;
    img.addEventListener("load", queueRefresh, { once: true });
  }
  window.addEventListener(THEME_CHANGE_EVENT, () => {
    document.fonts.ready.then(queueRefresh);
    queueRefresh();
  });
  document.fonts.ready.then(queueRefresh);
}

/* Hero headline rises out of its mask the instant the script runs — no gate
   between navigation and content. Masked line rise (not per-char) reads
   calmer and more deliberate. */
function heroRise(): void {
  const heading = document.querySelector<HTMLElement>("[data-hero-title]");
  const lines = heading
    ? new SplitText(heading, { type: "lines", mask: "lines", linesClass: "apex-line" }).lines
    : [];

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  if (lines.length) {
    gsap.set(lines, { yPercent: 115 });
    tl.to(lines, { yPercent: 0, duration: 1.05, stagger: 0.09 });
  }
  tl.fromTo(
    "[data-hero-rise]",
    { y: 26, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.09, ease: "power3.out" },
    lines.length ? "-=0.7" : 0,
  );
}

function reveals(): void {
  /* Section titles: masked word rise, scrubbed through the entry zone.
     clamp() so a title near the page end still resolves (the kinetic scar
     where the last headline stayed half-masked). */
  for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal-title]")) {
    const words = new SplitText(el, { type: "words", mask: "words", linesClass: "apex-line" }).words;
    gsap.from(words, {
      yPercent: 120,
      stagger: 0.04,
      ease: "none",
      scrollTrigger: { trigger: el, start: "clamp(top 90%)", end: "clamp(top 52%)", scrub: 0.35 },
    });
  }

  for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
    gsap.from(el, {
      y: 44,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: el, start: "clamp(top 94%)", end: "clamp(top 66%)", scrub: 0.35 },
    });
  }
}

/* One hairline progress line pinned to the very top edge — the entire HUD,
   replacing the frame + rail + chapter counter. */
function progress(): void {
  const fill = document.getElementById("apex-progress-fill");
  if (!fill) return;
  gsap.to(fill, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });
}

initApex();
