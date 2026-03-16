import { getDay, getStaticDayParams, getAllDays } from "@/lib/devlog"
import { CommitBadges } from "@/components/CommitBadge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DevlogContent } from "./DevlogContent"

export function generateStaticParams() {
  return getStaticDayParams()
}

type Props = { params: Promise<{ day: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day: dayStr } = await params
  const dayNum = parseInt(dayStr.replace("day-", ""), 10)
  const entry = getDay(dayNum)
  if (!entry) return {}
  return {
    title: `Day ${entry.day}: ${entry.title}`,
    description: entry.preview.slice(0, 160),
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

export default async function DevlogDayPage({ params }: Props) {
  const { day: dayStr } = await params
  const dayNum = parseInt(dayStr.replace("day-", ""), 10)
  const entry = getDay(dayNum)
  if (!entry) notFound()

  const allDays = getAllDays()
  const prev = allDays.find((d) => d.day === dayNum - 1)
  const next = allDays.find((d) => d.day === dayNum + 1)

  // Cycle through background images based on day number
  const bgImages = [
    "/images/arch_bg.png",
    "/images/protocol_1_bg.png",
    "/images/features_bg.png",
    "/images/protocol_2_bg.png",
    "/images/texture.png",
    "/images/protocol_3_bg.png",
    "/images/hero.png",
    "/images/arch_bg.png",
  ]
  const bgImage = bgImages[(entry.day - 1) % bgImages.length]

  return (
    <main className="relative min-h-screen bg-[var(--color-foreground)] text-[var(--color-primary)] selection:bg-[var(--color-accent)] selection:text-[var(--color-primary)]">

      {/* Hero header with background */}
      <section className="relative w-full pt-40 pb-20 px-8 md:px-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.12] mix-blend-screen"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--color-foreground)]/30 via-transparent to-[var(--color-foreground)]" />

        <div className="max-w-2xl mx-auto relative z-10">
          <a
            href="/devlog"
            className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-accent)] hover:opacity-70 transition-opacity mb-12"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Timeline
          </a>

          <header>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="font-mono text-[var(--color-accent)] text-sm">Day {entry.day}</span>
              <span className="font-mono text-xs opacity-40">{formatDate(entry.date)}</span>
              <span className="font-mono text-xs opacity-40">{entry.readingTime} min read</span>
            </div>
            <h1 className="font-serif italic text-5xl md:text-6xl leading-tight">{entry.title}</h1>
          </header>
        </div>
      </section>

      {/* Article body with subtle texture */}
      <section className="relative w-full px-8 md:px-16 py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.05] mix-blend-screen bg-[url('/images/texture.png')] bg-cover bg-center" />

        <article className="max-w-2xl mx-auto relative z-10">
          <DevlogContent content={entry.content} />

          <CommitBadges commits={entry.commits} />

          <nav className="mt-16 pt-8 border-t border-[var(--color-primary)]/10 flex justify-between">
            {prev ? (
              <a
                href={`/devlog/day-${prev.day}`}
                className="group flex flex-col gap-1 max-w-[45%]"
              >
                <span className="font-mono text-xs opacity-40 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Previous
                </span>
                <span className="font-serif italic text-lg group-hover:text-[var(--color-accent)] transition-colors">
                  Day {prev.day}: {prev.title}
                </span>
              </a>
            ) : <div />}
            {next ? (
              <a
                href={`/devlog/day-${next.day}`}
                className="group flex flex-col gap-1 items-end text-right max-w-[45%]"
              >
                <span className="font-mono text-xs opacity-40 flex items-center gap-1">
                  Next <ArrowRight className="w-3 h-3" />
                </span>
                <span className="font-serif italic text-lg group-hover:text-[var(--color-accent)] transition-colors">
                  Day {next.day}: {next.title}
                </span>
              </a>
            ) : <div />}
          </nav>
        </article>
      </section>

    </main>
  )
}
