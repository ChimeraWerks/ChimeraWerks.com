import { getAllDays } from "@/lib/devlog"
import type { Metadata } from "next"
import { DevlogTimeline } from "./DevlogTimeline"

export const metadata: Metadata = {
  title: "Devlog",
  description: "8 days. One developer. 35 commits. The behind-the-scenes story of building Chimera Studio from scratch.",
}

const ROADMAP = [
  "Chat frontend — the backend API works but there's no UI for it yet",
  "ChimeraVision — AI-powered image understanding and semantic search",
  "Side-by-side comparison for parameter diffing",
  "Rating system with ELO arena (pit your images against each other)",
  "Auto-tagging with content analysis",
]

export default function DevlogIndex() {
  const days = getAllDays()
  const totalCommits = days.reduce((sum, d) => sum + d.commitCount, 0)

  return (
    <main className="relative min-h-screen bg-[var(--color-foreground)] text-[var(--color-primary)] selection:bg-[var(--color-accent)] selection:text-[var(--color-primary)]">

      {/* Hero header with background image */}
      <section className="relative w-full pt-40 pb-24 px-8 md:px-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-screen"
          style={{ backgroundImage: "url('/images/arch_bg.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--color-foreground)]/30 via-transparent to-[var(--color-foreground)]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <p className="font-mono text-[var(--color-accent)] text-sm tracking-widest uppercase mb-4">Development Journal</p>
          <h1 className="font-serif italic text-6xl md:text-[8rem] leading-[0.85] mb-8">Devlog.</h1>
          <div className="flex flex-wrap items-center gap-6">
            <p className="font-mono text-sm opacity-50">
              {days.length} days &middot; 1 developer &middot; {totalCommits} commits
            </p>
            <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 border border-[var(--color-primary)]/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              Active Development
            </div>
          </div>
        </div>
      </section>

      {/* Timeline section with texture */}
      <section className="relative w-full py-16 px-8 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/texture.png')] bg-cover bg-center" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-12 font-mono text-sm tracking-widest uppercase border-b border-[var(--color-primary)]/10 pb-4 flex justify-between items-end">
            <span>Sprint Timeline</span>
            <span className="opacity-30">MAR 08 — PRESENT</span>
          </div>

          <DevlogTimeline days={days} />
        </div>
      </section>

      {/* Roadmap section */}
      <section className="relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.06] mix-blend-screen"
          style={{ backgroundImage: "url('/images/protocol_3_bg.png')" }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-12 font-mono text-sm tracking-widest uppercase border-b border-[var(--color-primary)]/10 pb-4">
            Roadmap
          </div>

          <div className="relative pl-12 md:pl-16">
            {/* Dashed spine */}
            <div className="absolute left-[18px] md:left-[26px] top-0 bottom-0 w-px border-l border-dashed border-[var(--color-primary)]/20" />

            <div className="mb-8">
              <div className="absolute left-2.5 md:left-[14px] w-7 h-7 md:w-7 md:h-7 rounded-full border-2 border-dashed border-[var(--color-primary)]/30 flex items-center justify-center">
                <span className="font-mono text-[10px] opacity-30">?</span>
              </div>
              <p className="font-serif italic text-3xl md:text-4xl mb-8 opacity-60">What&apos;s Coming</p>
            </div>

            <div className="flex flex-col gap-6">
              {ROADMAP.map((item, i) => (
                <div key={i} className="font-sans text-base opacity-40 pl-1 leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
