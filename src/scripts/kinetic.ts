/**
 * Motion orchestrator for the kinetic slice (dir-c). Encodes the grammar of
 * the KPRVERSE study:
 *   - lerped smooth scroll (Lenis): the page glides, nothing snaps
 *   - every reveal is scrubbed and reversible (ScrollTrigger scrub), never a
 *     one-shot "fade in on enter" — scrolling back plays the film backward
 *   - SplitText masked line/char reveals for chapter headlines
 *   - an instant hero rise on load (the boot loader was cut 2026-07: it cost
 *     3s of entry time for zero information — content leads now)
 *   - persistent HUD: scroll-progress rail + chapter counter
 *
 * Gate: reduced-motion never gets `html.kinetic`, so every pre-hidden or
 * JS-owned state stays inert and the page reads complete and static.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import { THEME_CHANGE_EVENT } from "../data/themes";

export function initKinetic(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add("kinetic");

  /* ------------------------------------------------------ smooth scroll --- */
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector<HTMLElement>(anchor.getAttribute("href") ?? "");
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    });
  }

  heroRise();
  hud();
  chapters();

  /* Anything that reflows the page AFTER triggers measure it leaves every
     trigger below the shift with stale positions — the contact headline was
     stuck half-masked at max scroll. Three reflow sources, one debounced
     refresh:
       1. lazy images landing (triptych plates, backdrops),
       2. a theme switch swapping the font stack (Archivo <-> Inter),
       3. the initial webfont swap itself. */
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
    /* New theme = possibly new font faces; wait for them before measuring. */
    document.fonts.ready.then(queueRefresh);
    queueRefresh();
  });
  document.fonts.ready.then(queueRefresh);
}

/* ------------------------------------------------------------- hero rise --- */

/*
 * Instant entry: the headline rises out of its mask the moment the script
 * runs — no gate between navigation and content.
 */
function heroRise(): void {
  const heroSplits = splitAll("[data-k-hero-split]", "chars");

  gsap.set(
    heroSplits.flatMap((s) => s.chars),
    { yPercent: 120, rotate: 4 },
  );
  gsap.to(
    heroSplits.flatMap((s) => s.chars),
    { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.028, ease: "power4.out" },
  );
  gsap.fromTo(
    "[data-k-hero-rise]",
    { y: 42, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.35 },
  );
}

/* ------------------------------------------------------------------- hud --- */

function hud(): void {
  const fill = document.getElementById("k-rail-fill");
  if (fill) {
    gsap.to(fill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
    });
  }

  const num = document.getElementById("k-ch-num");
  const name = document.getElementById("k-ch-name");
  if (!num || !name) return;
  for (const section of document.querySelectorAll<HTMLElement>("[data-chapter]")) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (!self.isActive) return;
        num.textContent = section.dataset.chapter ?? "";
        name.textContent = section.dataset.chapterName ?? "";
      },
    });
  }
}

/* -------------------------------------------------------------- chapters --- */

function chapters(): void {
  /* Chapter headlines: masked word rise, scrubbed through the entry zone.
     clamp(): elements near the page end can never reach an unclamped end
     position, which left the contact headline permanently half-masked
     (surfaced by the precision theme's Inter metrics shifting the layout). */
  for (const split of splitAll("[data-k-split]", "words")) {
    gsap.from(split.words, {
      yPercent: 130,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: split.elements[0] as Element,
        start: "clamp(top 92%)",
        end: "clamp(top 48%)",
        scrub: 0.3,
      },
    });
  }

  /* Generic content risers. */
  for (const el of gsap.utils.toArray<HTMLElement>('[data-k="rise"]')) {
    gsap.from(el, {
      y: 64,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "clamp(top 94%)",
        end: "clamp(top 62%)",
        scrub: 0.3,
      },
    });
  }

  /* Slow vertical drift: figures travel against the scroll for depth. */
  for (const el of gsap.utils.toArray<HTMLElement>('[data-k="drift"]')) {
    gsap.fromTo(
      el,
      { y: 48 },
      {
        y: -48,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  }

  /* Statement chapter: the copy is CSS-sticky inside a tall section; the
     scrub drives the masked words + the plate art's scale/clip while the
     reader traverses the extra height. */
  const statement = document.querySelector<HTMLElement>(".k-statement");
  if (statement) {
    const art = statement.querySelector(".k-statement-art");
    if (art) {
      gsap.fromTo(
        art,
        { scale: 1.18, clipPath: "inset(12% 10% 12% 10%)" },
        {
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: statement, start: "top bottom", end: "bottom bottom", scrub: 0.4 },
        },
      );
    }
  }
}

/* --------------------------------------------------------------- helpers --- */

interface KineticSplit {
  elements: Element[];
  chars: Element[];
  words: Element[];
}

function splitAll(selector: string, mask: "chars" | "words"): KineticSplit[] {
  const out: KineticSplit[] = [];
  for (const el of document.querySelectorAll(selector)) {
    const split = new SplitText(el, {
      type: "words,chars",
      mask,
      /* Masked wrappers clip descenders without this breathing room. */
      linesClass: "k-split-line",
    });
    out.push({ elements: [el], chars: split.chars, words: split.words });
  }
  return out;
}

initKinetic();
