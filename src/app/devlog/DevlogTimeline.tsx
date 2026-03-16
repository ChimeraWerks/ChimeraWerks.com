"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import type { DevlogEntry } from "@/lib/devlog"

gsap.registerPlugin(ScrollTrigger)

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()
}

export function DevlogTimeline({ days }: { days: DevlogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".timeline-entry", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Spine line */}
      <div className="absolute left-[18px] md:left-[26px] top-0 bottom-0 w-px bg-[var(--color-accent)]/30" />

      <div className="flex flex-col gap-12">
        {days.map((entry) => (
          <a
            key={entry.day}
            href={`/devlog/day-${entry.day}`}
            className="timeline-entry group relative pl-12 md:pl-16 block"
          >
            {/* Day circle */}
            <div className="absolute left-0 md:left-1 w-9 h-9 md:w-[52px] md:h-[52px] rounded-full bg-[var(--color-accent)] flex items-center justify-center -translate-x-[calc(50%-18px)] md:-translate-x-[calc(50%-26px)]">
              <span className="font-mono font-bold text-xs md:text-sm text-white">{entry.day}</span>
            </div>

            {/* Card */}
            <div className="brutalist-card-dark p-6 md:p-8 group-hover:border-[var(--color-accent)]/30 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <span className="font-mono text-xs opacity-50">{formatDate(entry.date)}</span>
                {entry.commitCount > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                    {entry.commitCount} {entry.commitCount === 1 ? "commit" : "commits"}
                  </span>
                )}
                {entry.commitCount === 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--color-primary)]/10 opacity-40">
                    research day
                  </span>
                )}
              </div>
              <h2 className="font-serif italic text-2xl md:text-3xl mb-3 group-hover:text-[var(--color-accent)] transition-colors">
                {entry.title}
              </h2>
              <p className="font-sans text-sm opacity-60 leading-relaxed line-clamp-2 mb-4">
                {entry.preview}
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                Read Entry <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
