"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const DAYS = [
  { day: 1, date: "MAR 08", title: "There Has to Be a Better Way", commits: 4, tag: "foundation" },
  { day: 2, date: "MAR 09", title: "Making Filters Actually Smart", commits: 4, tag: "filters" },
  { day: 3, date: "MAR 10", title: "The Marathon Day", commits: 10, tag: "rebrand" },
  { day: 4, date: "MAR 11", title: "Music Gets Real + Going Remote", commits: 2, tag: "music" },
  { day: 5, date: "MAR 12", title: "The Infrastructure Day", commits: 7, tag: "auth" },
  { day: 6, date: "MAR 13", title: "ChimeraCore — Giving the App a Brain", commits: 1, tag: "inference" },
  { day: 7, date: "MAR 14", title: "The Thinking Day", commits: 0, tag: "research" },
  { day: 8, date: "MAR 15", title: "Teaching the App to Talk", commits: 1, tag: "chat" },
  { day: 9, date: "MAR 15", title: "The One Where It Gets a Face", commits: 1, tag: "website" },
  { day: 10, date: "MAR 16", title: "The Boring Day (That Wasn't)", commits: 2, tag: "cleanup" },
  { day: 11, date: "MAR 17", title: "Browse Mode, Trash API, Mobile, Trader", commits: 11, tag: "mobile" },
  { day: 12, date: "MAR 18", title: "Music Gets Serious", commits: 1, tag: "music" },
  { day: 13, date: "MAR 19", title: "Live Market Data and a Discord Ghost Story", commits: 4, tag: "trader" },
  { day: 14, date: "MAR 20", title: "The 40B Model That Fits on One GPU", commits: 1, tag: "inference" },
  { day: 15, date: "MAR 21", title: "The Great Reorganization", commits: 0, tag: "cleanup" },
  { day: 17, date: "MAR 22", title: "Terminal Rewrite + Security Panic", commits: 1, tag: "security" },
]

// Relative bar height based on commit count (max 10)
function commitBarHeight(commits: number): string {
  if (commits === 0) return "h-1"
  const pct = Math.max(12, Math.round((commits / 10) * 100))
  return `h-[${pct}%]`
}

export function DevlogTeaser() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Draw the connecting line
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength()
        gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "center center",
            scrub: 0.5,
          },
        })
      }

      // Stagger nodes in
      gsap.from(".devlog-node", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(1.7)",
      })

      // Stagger labels in
      gsap.from(".devlog-label", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      })

      // Commit bars grow
      gsap.from(".commit-bar-fill", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 55%",
        },
        scaleY: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power2.out",
        transformOrigin: "bottom",
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 px-8 md:px-16 bg-[var(--color-foreground)] text-[var(--color-primary)] border-t border-[var(--color-primary)]/10 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="font-mono text-[var(--color-accent)] text-sm tracking-widest uppercase mb-4">Development Journal</p>
          <h2 className="font-serif italic text-5xl md:text-7xl mb-4">Building in Public.</h2>
          <p className="font-sans text-lg opacity-60 max-w-xl mx-auto">
            Follow along as Chimera Studio evolves from idea to platform.
          </p>
        </div>

        {/* Desktop: Horizontal journey map */}
        <div className="hidden md:block relative mb-16">
          {/* Row 1: Commit bars */}
          <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
            {DAYS.map((entry) => (
              <div key={entry.day} className="flex justify-center h-16 items-end">
                <div className="w-6 bg-[var(--color-primary)]/5 rounded-t-sm h-full relative overflow-hidden">
                  <div
                    className="commit-bar-fill absolute bottom-0 left-0 w-full rounded-t-sm bg-[var(--color-accent)]"
                    style={{ height: entry.commits === 0 ? "4px" : `${Math.max(15, (entry.commits / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Node circles with connecting line */}
          <div className="relative">
            {/* SVG connecting line behind circles */}
            <svg className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 overflow-visible" preserveAspectRatio="none">
              <line
                ref={lineRef}
                x1="6%" y1="0" x2="94%" y2="0"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
            </svg>
            <div className="grid gap-2 relative z-10" style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
              {DAYS.map((entry) => (
                <a
                  key={entry.day}
                  href={`/devlog/day-${entry.day}`}
                  className="devlog-node flex justify-center group"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-foreground)] flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-all">
                    <span className="font-mono text-xs font-bold text-[var(--color-accent)] group-hover:text-white transition-colors">
                      {entry.day}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Row 3: Labels */}
          <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
            {DAYS.map((entry) => (
              <a
                key={entry.day}
                href={`/devlog/day-${entry.day}`}
                className="devlog-label text-center group"
              >
                <span className="font-mono text-[10px] opacity-40 block mb-1">{entry.date}</span>
                <span className="font-serif italic text-xs leading-tight block group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 px-1">
                  {entry.title}
                </span>
                {entry.commits > 0 ? (
                  <span className="font-mono text-[10px] opacity-30 mt-1 block">{entry.commits} commits</span>
                ) : (
                  <span className="font-mono text-[10px] opacity-20 mt-1 block">research</span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical compact timeline */}
        <div className="md:hidden relative mb-12">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[var(--color-accent)]/20" />

          <div className="flex flex-col gap-4">
            {DAYS.map((entry) => (
              <a
                key={entry.day}
                href={`/devlog/day-${entry.day}`}
                className="devlog-node group flex items-center gap-4 pl-0 relative"
              >
                {/* Node */}
                <div className="w-10 h-10 rounded-full border-2 border-[var(--color-accent)]/40 bg-[var(--color-foreground)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-accent)] transition-colors relative z-10">
                  <span className="font-mono text-xs font-bold">{entry.day}</span>
                </div>

                {/* Content */}
                <div className="flex-1 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] opacity-40">{entry.date}</span>
                    {entry.commits > 0 && (
                      <div className="flex gap-px">
                        {Array.from({ length: Math.min(entry.commits, 10) }).map((_, i) => (
                          <div key={i} className="w-1 h-3 rounded-full bg-[var(--color-accent)]/40" />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-serif italic text-sm group-hover:text-[var(--color-accent)] transition-colors">
                    {entry.title}
                  </span>
                </div>

                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/devlog"
            className="btn-magnetic px-8 py-4 bg-transparent border border-[var(--color-primary)]/30 text-[var(--color-primary)] font-mono font-bold uppercase rounded-full inline-flex items-center gap-3 hover:bg-[var(--color-primary)]/10 transition-colors"
          >
            <span>Read the Full Devlog</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
          </a>
        </div>
      </div>
    </section>
  )
}
