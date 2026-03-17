"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Shield,
  Search,
  GitBranch,
  Globe,
  Puzzle,
  Terminal,
  Cpu,
  FileSearch,
  BookOpen,
  Package,
  Zap,
  Layers,
  ExternalLink,
  FolderOpen,
  FileText,
  Monitor,
  Smartphone,
  FileDown,
  Network,
  Radar,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type ToolSource = "official" | "community"
type ToolPlatform = "cli" | "ccd" | "both" | "system"

interface ToolEntry {
  name: string
  description: string
  why: string
  icon: React.ReactNode
  link?: string
  tag: string
  source: ToolSource
  platform: ToolPlatform
  install: string
}

const plugins: ToolEntry[] = [
  {
    name: "GitHub",
    tag: "github@claude-plugins-official",
    description: "Native GitHub integration. Create PRs, manage issues, search repos, and review code without leaving the editor.",
    why: "Core workflow — every commit, branch, and PR flows through this.",
    icon: <GitBranch className="w-5 h-5" />,
    link: "https://github.com/anthropics/claude-code",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Playwright",
    tag: "playwright@claude-plugins-official",
    description: "Browser automation for testing web apps. Navigate, click, fill forms, take screenshots, and validate UI behavior programmatically.",
    why: "Live-test Chimera Studio's frontend without manual clicking.",
    icon: <Globe className="w-5 h-5" />,
    link: "https://playwright.dev",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Code Simplifier",
    tag: "code-simplifier@claude-plugins-official",
    description: "Automatically simplifies and refines code after writing. Reduces complexity while preserving functionality.",
    why: "Keeps code lean. Fights the natural entropy of iterative development.",
    icon: <Zap className="w-5 h-5" />,
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "PR Review Toolkit",
    tag: "pr-review-toolkit@claude-plugins-official",
    description: "Specialized review agents for pull requests. Runs code review, type analysis, silent failure detection, and comment analysis in parallel.",
    why: "Comprehensive PR review without context-switching to a browser.",
    icon: <Layers className="w-5 h-5" />,
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Context7",
    tag: "context7@claude-plugins-official",
    description: "Fetches up-to-date documentation and code examples for any library. Queries real docs instead of relying on training data.",
    why: "No more hallucinated API signatures. Always current docs.",
    icon: <BookOpen className="w-5 h-5" />,
    link: "https://context7.com",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Feature Dev",
    tag: "feature-dev@claude-plugins-official",
    description: "Guided feature development with codebase exploration, architecture design, and implementation review agents.",
    why: "Structured feature planning that understands the existing codebase.",
    icon: <Cpu className="w-5 h-5" />,
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
]

const mcpServers: ToolEntry[] = [
  {
    name: "Everything Search",
    tag: "mcp-server-everything-search",
    description: "Instant full-system file search powered by Voidtools Everything. Finds any file on any NTFS drive in milliseconds via the Everything SDK.",
    why: "Find any file across all drives instantly. No more manual browsing or slow Windows Search.",
    icon: <Search className="w-5 h-5" />,
    link: "https://github.com/mamertofabian/mcp-everything-search",
    source: "community",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + claude_desktop_config.json (CCD)",
  },
  {
    name: "Comfy-Pilot",
    tag: "comfyui (comfy-pilot)",
    description: "MCP server bridging Claude to a running ComfyUI instance. Execute workflows, manage nodes, and control image generation pipelines directly from the AI assistant.",
    why: "Direct AI control over ComfyUI workflows. Queue generations, swap models, and iterate without touching the browser.",
    icon: <Puzzle className="w-5 h-5" />,
    link: "https://github.com/ConstantineB6/comfy-pilot",
    source: "community",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + claude_desktop_config.json (CCD)",
  },
  {
    name: "Filesystem",
    tag: "ant.dir.ant.anthropic.filesystem",
    description: "Read, write, search, and manage files and directories. Gives Claude direct access to your local filesystem for editing code, organizing files, and exploring project structures.",
    why: "Essential for any coding task in Claude Desktop. CC CLI has this built-in.",
    icon: <FolderOpen className="w-5 h-5" />,
    source: "official",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + CCD Extensions tab",
  },
  {
    name: "Windows-MCP",
    tag: "ant.dir.cursortouch.windows-mcp",
    description: "Windows system control via MCP. Manage processes, read system info, interact with the Windows shell, control windows, and automate OS-level tasks.",
    why: "System automation — kill processes, check ports, manage services without switching to a terminal.",
    icon: <Monitor className="w-5 h-5" />,
    source: "community",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + CCD Extensions tab",
  },
  {
    name: "Android-MCP",
    tag: "ant.dir.gh.cursortouch.android-mcp",
    description: "Control Android emulators and devices via ADB. Take screenshots, tap elements, install APKs, and automate mobile app testing from Claude Desktop.",
    why: "Future mobile app development — test Android builds without manual ADB commands.",
    icon: <Smartphone className="w-5 h-5" />,
    link: "https://github.com/anthropics/android-mcp",
    source: "community",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + CCD Extensions tab",
  },
  {
    name: "Docling MCP",
    tag: "ant.dir.gh.docling-project.docling-mcp",
    description: "Advanced document conversion and parsing. Converts PDFs, Word docs, PowerPoints, and other formats into structured markdown or JSON using IBM's Docling engine.",
    why: "Heavy-duty document parsing — when the built-in PDF reader isn't enough for complex layouts or non-PDF formats.",
    icon: <FileDown className="w-5 h-5" />,
    link: "https://github.com/docling-project/docling-mcp",
    source: "community",
    platform: "both",
    install: "~/.claude/.mcp.json (CLI) + CCD Extensions tab",
  },
]

const prerequisites: ToolEntry[] = [
  {
    name: "uv",
    tag: "astral-sh/uv",
    description: "Blazing-fast Python package installer and runner. Used by Claude extensions to manage their own virtual environments and dependencies.",
    why: "Required by Claude Code's extension system. Extensions won't install without it.",
    icon: <Terminal className="w-5 h-5" />,
    link: "https://github.com/astral-sh/uv",
    source: "community",
    platform: "system",
    install: "irm https://astral.sh/uv/install.ps1 | iex",
  },
  {
    name: "Voidtools Everything",
    tag: "voidtools.com",
    description: "System-wide instant file search for Windows. Indexes every file on all NTFS drives in seconds. Runs as a lightweight tray app. The Everything SDK DLL is needed for the MCP server.",
    why: "The backbone of the Everything Search MCP. Must be running for searches to work.",
    icon: <Search className="w-5 h-5" />,
    link: "https://www.voidtools.com",
    source: "community",
    platform: "system",
    install: "winget install voidtools.Everything + SDK DLL",
  },
]

type SkillScope = "global" | "project"

interface SkillEntry {
  name: string
  command: string
  description: string
  why: string
  icon: React.ReactNode
  scope: SkillScope
}

const customSkills: SkillEntry[] = [
  {
    name: "Research",
    command: "/research",
    description: "Auto-scaling web research powered by Crawl4AI. Searches the web, scrapes results in parallel with BM25 content filtering, and auto-escalates to adaptive deep crawling when information is incomplete or conflicting.",
    why: "Get thorough, sourced answers without leaving the terminal. Reads the actual pages, not summaries.",
    icon: <Radar className="w-5 h-5" />,
    scope: "global",
  },
  {
    name: "Scrape",
    command: "/scrape",
    description: "Direct URL extraction with Crawl4AI. Fetches raw markdown, structured data via CSS selectors, deep site crawls, and PDF parsing. Supports virtual scroll for infinite-feed sites.",
    why: "When you need the actual content from a specific page — not a search engine summary.",
    icon: <Network className="w-5 h-5" />,
    scope: "global",
  },
  {
    name: "Security Audit",
    command: "/audit-security",
    description: "On-demand security audit using Semgrep static analysis + manual OWASP Top 10 review. Scans changed files or full project, triages findings, and filters false positives.",
    why: "Replaced always-on security plugins that burned tokens every message. Run when you actually need it.",
    icon: <Shield className="w-5 h-5" />,
    scope: "global",
  },
  {
    name: "Max Mode",
    command: "/max",
    description: "Switches to maximum accuracy mode. Unlimited agents, full file reads, thorough validation on every step. No shortcuts.",
    why: "For critical work where getting it right matters more than speed.",
    icon: <Zap className="w-5 h-5" />,
    scope: "global",
  },
]

interface CrawlerEntry {
  name: string
  description: string
  icon: React.ReactNode
  tag: string
}

const crawlerFeatures: CrawlerEntry[] = [
  {
    name: "Parallel Scraping",
    description: "Scrape 20-50+ URLs simultaneously using MemoryAdaptiveDispatcher. Auto-throttles based on available RAM — no hardcoded limits.",
    icon: <Zap className="w-5 h-5" />,
    tag: "arun_many + dispatcher",
  },
  {
    name: "BM25 Content Filtering",
    description: "Query-relevant extraction that reduces 500KB pages to ~2KB of relevant paragraphs. Zero token cost — runs locally with pure algorithmic text ranking.",
    icon: <FileSearch className="w-5 h-5" />,
    tag: "BM25ContentFilter",
  },
  {
    name: "Adaptive Crawling",
    description: "Auto-stops when information is saturated. Tracks coverage, consistency, and saturation across pages — knows when to keep going and when to stop.",
    icon: <Radar className="w-5 h-5" />,
    tag: "AdaptiveCrawler",
  },
  {
    name: "Anti-Bot Detection",
    description: "3-tier detection for Cloudflare, Akamai, PerimeterX, DataDome, and more. Auto-retries with proxy escalation chains when blocked.",
    icon: <Shield className="w-5 h-5" />,
    tag: "v0.8.5 develop branch",
  },
  {
    name: "Stealth Browser",
    description: "Patchright (stealth Playwright fork) with persistent profile, consent popup removal, shadow DOM flattening, and ad/CSS blocking.",
    icon: <Globe className="w-5 h-5" />,
    tag: "BrowserConfig",
  },
  {
    name: "PDF & Virtual Scroll",
    description: "Parse PDFs directly. Handle Twitter/Instagram-style virtual scroll where content replaces instead of appends. Extract from any page type.",
    icon: <FileText className="w-5 h-5" />,
    tag: "PDFCrawlerStrategy + VirtualScrollConfig",
  },
]

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

const SOURCE_LABELS: Record<ToolSource, { text: string; cls: string }> = {
  official: { text: "Anthropic", cls: "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30" },
  community: { text: "Community", cls: "bg-[var(--color-primary)]/5 text-[var(--color-primary)]/60 border-[var(--color-primary)]/15" },
}

const PLATFORM_LABELS: Record<ToolPlatform, { text: string; cls: string }> = {
  cli: { text: "CC CLI", cls: "bg-blue-500/10 text-blue-400/80 border-blue-400/20" },
  ccd: { text: "CCD", cls: "bg-purple-500/10 text-purple-400/80 border-purple-400/20" },
  both: { text: "CLI + CCD", cls: "bg-emerald-500/10 text-emerald-400/80 border-emerald-400/20" },
  system: { text: "System", cls: "bg-amber-500/10 text-amber-400/80 border-amber-400/20" },
}

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${cls}`}>
      {text}
    </span>
  )
}

function ToolCard({ tool, index }: { tool: ToolEntry; index: number }) {
  const src = SOURCE_LABELS[tool.source]
  const plat = PLATFORM_LABELS[tool.platform]

  return (
    <div
      className="tool-card brutalist-card-dark p-6 md:p-8 flex flex-col gap-4"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
            {tool.icon}
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg">{tool.name}</h3>
            <span className="font-mono text-xs opacity-40">{tool.tag}</span>
          </div>
        </div>
        {tool.link && (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-[var(--color-accent)] opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            view
          </a>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge text={src.text} cls={src.cls} />
        <Badge text={plat.text} cls={plat.cls} />
      </div>

      {/* Description */}
      <p className="font-sans text-sm opacity-70 leading-relaxed">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-[var(--color-primary)]/5 flex flex-col gap-2">
        <p className="font-mono text-xs text-[var(--color-accent)]/80">
          <span className="opacity-50">WHY:</span> {tool.why}
        </p>
        <p className="font-mono text-[10px] opacity-30">
          <span className="opacity-70">INSTALL:</span> {tool.install}
        </p>
      </div>
    </div>
  )
}

const SCOPE_LABELS: Record<SkillScope, { text: string; cls: string }> = {
  global: { text: "Global", cls: "bg-emerald-500/10 text-emerald-400/80 border-emerald-400/20" },
  project: { text: "Project", cls: "bg-amber-500/10 text-amber-400/80 border-amber-400/20" },
}

function SkillCard({ skill, index }: { skill: SkillEntry; index: number }) {
  const scopeBadge = SCOPE_LABELS[skill.scope]

  return (
    <div
      className="tool-card brutalist-card-dark p-6 md:p-8 flex flex-col gap-4"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
            {skill.icon}
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg">{skill.name}</h3>
            <span className="font-mono text-xs text-[var(--color-accent)]">{skill.command}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge text={scopeBadge.text} cls={scopeBadge.cls} />
        <Badge text="Custom" cls="bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30" />
      </div>

      <p className="font-sans text-sm opacity-70 leading-relaxed">
        {skill.description}
      </p>

      <div className="mt-auto pt-3 border-t border-[var(--color-primary)]/5">
        <p className="font-mono text-xs text-[var(--color-accent)]/80">
          <span className="opacity-50">WHY:</span> {skill.why}
        </p>
      </div>
    </div>
  )
}

function CrawlerCard({ feature, index }: { feature: CrawlerEntry; index: number }) {
  return (
    <div
      className="tool-card brutalist-card-dark p-6 flex flex-col gap-3"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
          {feature.icon}
        </div>
        <div>
          <h3 className="font-sans font-bold text-base">{feature.name}</h3>
          <span className="font-mono text-[10px] opacity-40">{feature.tag}</span>
        </div>
      </div>
      <p className="font-sans text-sm opacity-70 leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string
  title: string
  subtitle: string
}) {
  return (
    <div className="section-header mb-16">
      <span className="font-mono text-[var(--color-accent)] text-sm tracking-widest uppercase block mb-4">
        {label}
      </span>
      <h2 className="font-serif italic text-4xl md:text-6xl mb-4">{title}</h2>
      <p className="font-sans text-lg opacity-60 max-w-2xl">{subtitle}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ToolkitPage() {
  const comp = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar morph (same as main page)
      ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: "nav-scrolled", targets: ".navbar" },
      })

      // Hero entrance
      gsap.from(".toolkit-hero-line", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      })

      // Section headers
      gsap.utils.toArray(".section-header").forEach((el) => {
        gsap.from(el as HTMLElement, {
          scrollTrigger: {
            trigger: el as HTMLElement,
            start: "top 75%",
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        })
      })

      // Tool cards stagger per section
      gsap.utils.toArray(".tool-section").forEach((section) => {
        const cards = (section as HTMLElement).querySelectorAll(".tool-card")
        gsap.from(cards, {
          scrollTrigger: {
            trigger: section as HTMLElement,
            start: "top 70%",
          },
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        })
      })

      // Download CTA
      gsap.from(".download-cta", {
        scrollTrigger: {
          trigger: ".download-cta",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    }, comp)

    return () => ctx.revert()
  }, [])

  return (
    <main
      ref={comp}
      className="relative min-h-screen selection:bg-[var(--color-accent)] selection:text-[var(--color-primary)]"
    >
      {/* HERO + STATS + LEGEND wrapper */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen bg-[url('/images/texture.png')] bg-cover bg-center" />

      {/* HERO */}
      <section className="relative w-full pt-40 pb-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto relative z-10 text-[var(--color-primary)]">
          <div className="toolkit-hero-line font-mono text-sm tracking-widest uppercase opacity-40 mb-6">
            Internal Toolkit
          </div>
          <h1 className="flex flex-col gap-2 mb-8">
            <span className="toolkit-hero-line font-sans font-bold text-2xl md:text-4xl tracking-tight opacity-80 uppercase">
              Claude Code
            </span>
            <span className="toolkit-hero-line font-serif italic text-5xl md:text-[7rem] leading-[0.85]">
              Arsenal.
            </span>
          </h1>
          <p className="toolkit-hero-line font-sans text-lg md:text-xl opacity-60 max-w-2xl">
            Every extension, plugin, and MCP server powering the ChimeraWerks
            development environment.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-10 w-full px-8 md:px-16 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="brutalist-card-dark p-6 text-center">
              <div className="font-serif italic text-3xl md:text-5xl text-[var(--color-accent)]">
                {plugins.length}
              </div>
              <div className="font-mono text-xs opacity-50 mt-2 uppercase">
                CLI Plugins
              </div>
            </div>
            <div className="brutalist-card-dark p-6 text-center">
              <div className="font-serif italic text-3xl md:text-5xl text-[var(--color-accent)]">
                {mcpServers.length}
              </div>
              <div className="font-mono text-xs opacity-50 mt-2 uppercase">
                MCP Servers
              </div>
            </div>
            <div className="brutalist-card-dark p-6 text-center">
              <div className="font-serif italic text-3xl md:text-5xl text-[var(--color-accent)]">
                {customSkills.length}
              </div>
              <div className="font-mono text-xs opacity-50 mt-2 uppercase">
                Custom Skills
              </div>
            </div>
            <div className="brutalist-card-dark p-6 text-center">
              <div className="font-serif italic text-3xl md:text-5xl text-[var(--color-accent)]">
                {prerequisites.length}
              </div>
              <div className="font-mono text-xs opacity-50 mt-2 uppercase">
                Prerequisites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEGEND */}
      <section className="relative z-10 w-full px-8 md:px-16 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="brutalist-card-dark p-6">
            <div className="font-mono text-xs text-[var(--color-accent)] mb-4 uppercase tracking-widest">Legend</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
              <div className="flex flex-col gap-2">
                <div className="font-mono text-xs opacity-50 uppercase mb-1">Source</div>
                <div className="flex items-center gap-2">
                  <Badge text="Anthropic" cls={SOURCE_LABELS.official.cls} />
                  <span className="font-sans text-xs opacity-50">Official Anthropic plugin or skill pack</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text="Community" cls={SOURCE_LABELS.community.cls} />
                  <span className="font-sans text-xs opacity-50">Open-source / third-party project</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-mono text-xs opacity-50 uppercase mb-1">Platform</div>
                <div className="flex items-center gap-2">
                  <Badge text="CC CLI" cls={PLATFORM_LABELS.cli.cls} />
                  <span className="font-sans text-xs opacity-50">Claude Code terminal &amp; VS Code only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text="CLI + CCD" cls={PLATFORM_LABELS.both.cls} />
                  <span className="font-sans text-xs opacity-50">Works in both CLI and Claude Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text="System" cls={PLATFORM_LABELS.system.cls} />
                  <span className="font-sans text-xs opacity-50">System-level tool installed globally</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>{/* end HERO + STATS + LEGEND wrapper */}

      {/* PLUGINS */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/features_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="01 / Extensions — Anthropic Official"
            title="Plugins."
            subtitle="Claude Code CLI plugins enabled via the /plugins command. These add specialized agents, skills, and integrations that activate automatically based on context. Not available in Claude Desktop — CCD has its own separate extension marketplace."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plugins.map((tool, i) => (
              <ToolCard key={tool.tag} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* MCP SERVERS */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/protocol_1_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="02 / Model Context Protocol"
            title="MCP Servers."
            subtitle="MCP servers expose external tools to Claude via a standardized protocol. These run as local processes and work in both CC CLI and Claude Desktop."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mcpServers.map((tool, i) => (
              <ToolCard key={tool.tag} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PREREQUISITES */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/protocol_1_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="03 / Dependencies"
            title="Prerequisites."
            subtitle="System-level tools required by the plugins and MCP servers above."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prerequisites.map((tool, i) => (
              <ToolCard key={tool.tag} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOM SKILLS */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/features_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="04 / Slash Commands — Custom Built"
            title="Skills."
            subtitle="Custom slash commands built for this workflow. These replace generic always-on plugins with targeted, on-demand tools that only cost tokens when invoked."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customSkills.map((skill, i) => (
              <SkillCard key={skill.command} skill={skill} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CRAWL4AI */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/arch_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="05 / Web Intelligence — Crawl4AI"
            title="Crawler."
            subtitle="Open-source web crawling engine (v0.8.5 develop branch) powering the /research and /scrape skills. Runs locally with a stealth Chromium browser, persistent profile, and intelligent content filtering."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crawlerFeatures.map((feature, i) => (
              <CrawlerCard key={feature.name} feature={feature} index={i} />
            ))}
          </div>
          <div className="mt-8 brutalist-card-dark p-6">
            <div className="font-mono text-xs text-[var(--color-accent)] mb-3 uppercase tracking-widest">Stack</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm opacity-60">
              <div><span className="text-[var(--color-accent)]">Engine:</span> Crawl4AI</div>
              <div><span className="text-[var(--color-accent)]">Browser:</span> Patchright</div>
              <div><span className="text-[var(--color-accent)]">Python:</span> conda ai env</div>
              <div><span className="text-[var(--color-accent)]">Cache:</span> SQLite + disk</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
