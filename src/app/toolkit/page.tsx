"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Download,
  Shield,
  Code,
  Search,
  GitBranch,
  Globe,
  Puzzle,
  Terminal,
  Cpu,
  FileSearch,
  BookOpen,
  Paintbrush,
  Bot,
  Wrench,
  Package,
  Zap,
  Eye,
  Layers,
  MonitorSmartphone,
  ExternalLink,
  FolderOpen,
  FileText,
  Monitor,
  Smartphone,
  FileDown,
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
    name: "Semgrep",
    tag: "semgrep@claude-plugins-official",
    description: "Static analysis security scanner. Catches vulnerabilities, anti-patterns, and code smells across Python and TypeScript.",
    why: "Automated security gate — catches OWASP issues before they ship.",
    icon: <Shield className="w-5 h-5" />,
    link: "https://semgrep.dev",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI + semgrep CLI required",
  },
  {
    name: "CodeRabbit",
    tag: "coderabbit@claude-plugins-official",
    description: "AI-powered code review. Analyzes diffs for bugs, logic errors, security issues, and style violations.",
    why: "Second pair of eyes on every change. Catches what linters miss.",
    icon: <Eye className="w-5 h-5" />,
    link: "https://coderabbit.ai",
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
    name: "Security Guidance",
    tag: "security-guidance@claude-plugins-official",
    description: "Recommends secure-by-default libraries and patterns. Covers XSS, CSRF, SSRF, deserialization, and crypto.",
    why: "Proactive security nudges instead of reactive patching.",
    icon: <Shield className="w-5 h-5" />,
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
  {
    name: "Firecrawl",
    tag: "firecrawl@claude-plugins-official",
    description: "Web scraping and research tool. Crawls URLs, extracts content, and returns LLM-optimized text for analysis.",
    why: "Research libraries, APIs, and competitors without leaving the terminal.",
    icon: <Globe className="w-5 h-5" />,
    link: "https://firecrawl.dev",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Frontend Design",
    tag: "frontend-design@claude-plugins-official",
    description: "Production-grade UI generation. Creates distinctive interfaces with high design quality using React, Tailwind, and modern patterns.",
    why: "Rapid UI prototyping that actually looks professional.",
    icon: <Paintbrush className="w-5 h-5" />,
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "CLAUDE.md Management",
    tag: "claude-md-management@claude-plugins-official",
    description: "Audits and improves CLAUDE.md project instruction files. Ensures Claude always has accurate context about the codebase.",
    why: "Keeps the AI's knowledge of the project fresh and correct.",
    icon: <FileSearch className="w-5 h-5" />,
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI",
  },
  {
    name: "Document Skills",
    tag: "document-skills@anthropic-agent-skills",
    description: "Skill pack for creating PDFs, Word docs, spreadsheets, presentations, and algorithmic art. Reads and writes office formats natively.",
    why: "Generate reports, exports, and docs directly from the CLI.",
    icon: <Package className="w-5 h-5" />,
    link: "https://github.com/anthropics/skills",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI + anthropic-agent-skills marketplace",
  },
  {
    name: "Claude API Skills",
    tag: "claude-api@anthropic-agent-skills",
    description: "Build apps using the Claude API and Anthropic SDK. Provides patterns, examples, and best practices for AI-powered applications.",
    why: "Useful when building AI features into Chimera Studio.",
    icon: <Bot className="w-5 h-5" />,
    link: "https://github.com/anthropics/skills",
    source: "official",
    platform: "cli",
    install: "/plugins in CC CLI + anthropic-agent-skills marketplace",
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
]

const ccdExtensions: ToolEntry[] = [
  {
    name: "Filesystem",
    tag: "ant.dir.ant.anthropic.filesystem",
    description: "Read, write, search, and manage files and directories. Gives Claude Desktop direct access to your local filesystem for editing code, organizing files, and exploring project structures.",
    why: "Lets CCD read and edit files on disk — essential for any coding task in Claude Desktop.",
    icon: <FolderOpen className="w-5 h-5" />,
    source: "official",
    platform: "ccd",
    install: "CCD Extensions tab",
  },
  {
    name: "PDF",
    tag: "ant.dir.gh.anthropic.pdf-server-mcp",
    description: "Read, parse, and extract content from PDF documents. Handles text extraction, page navigation, and structured data retrieval from PDF files.",
    why: "Analyze research papers, invoices, documentation — any PDF — directly in chat.",
    icon: <FileText className="w-5 h-5" />,
    link: "https://github.com/anthropics/pdf-server-mcp",
    source: "official",
    platform: "ccd",
    install: "CCD Extensions tab",
  },
  {
    name: "Windows-MCP",
    tag: "ant.dir.cursortouch.windows-mcp",
    description: "Windows system control via MCP. Manage processes, read system info, interact with the Windows shell, control windows, and automate OS-level tasks.",
    why: "System automation — kill processes, check ports, manage services without switching to a terminal.",
    icon: <Monitor className="w-5 h-5" />,
    source: "community",
    platform: "ccd",
    install: "CCD Extensions tab (requires uv)",
  },
  {
    name: "Android-MCP",
    tag: "ant.dir.gh.cursortouch.android-mcp",
    description: "Control Android emulators and devices via ADB. Take screenshots, tap elements, install APKs, and automate mobile app testing from Claude Desktop.",
    why: "Future mobile app development — test Android builds without manual ADB commands.",
    icon: <Smartphone className="w-5 h-5" />,
    link: "https://github.com/anthropics/android-mcp",
    source: "community",
    platform: "ccd",
    install: "CCD Extensions tab (requires Android emulator running)",
  },
  {
    name: "Docling MCP",
    tag: "ant.dir.gh.docling-project.docling-mcp",
    description: "Advanced document conversion and parsing. Converts PDFs, Word docs, PowerPoints, and other formats into structured markdown or JSON using IBM's Docling engine.",
    why: "Heavy-duty document parsing — when the built-in PDF reader isn't enough for complex layouts or non-PDF formats.",
    icon: <FileDown className="w-5 h-5" />,
    link: "https://github.com/docling-project/docling-mcp",
    source: "community",
    platform: "ccd",
    install: "CCD Extensions tab (requires Python + pipx)",
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
    name: "Semgrep CLI",
    tag: "semgrep v1.155+",
    description: "The command-line binary that powers the Semgrep plugin. Performs actual static analysis scans on your codebase.",
    why: "Plugin is just the integration layer — the real scanning engine runs locally.",
    icon: <Code className="w-5 h-5" />,
    link: "https://semgrep.dev",
    source: "community",
    platform: "system",
    install: "pip install semgrep",
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
      {/* HERO */}
      <section className="relative w-full pt-40 pb-24 px-8 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen bg-[url('/images/texture.png')] bg-cover bg-center" />
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
            development environment. One script installs it all.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative w-full px-8 md:px-16 pb-16">
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
                {ccdExtensions.length}
              </div>
              <div className="font-mono text-xs opacity-50 mt-2 uppercase">
                CCD Extensions
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
      <section className="relative w-full px-8 md:px-16 pb-8">
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
                  <Badge text="CCD" cls={PLATFORM_LABELS.ccd.cls} />
                  <span className="font-sans text-xs opacity-50">Claude Desktop only (Extensions tab)</span>
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

      {/* CCD EXTENSIONS */}
      <section className="tool-section relative w-full py-24 px-8 md:px-16 border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] mix-blend-screen bg-[url('/images/arch_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="02 / Claude Desktop — Official + Community"
            title="CCD Extensions."
            subtitle="Extensions installed via the Claude Desktop Extensions tab. These are separate from CC CLI plugins — CCD has its own marketplace. Includes both Anthropic official tools and community-built integrations."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ccdExtensions.map((tool, i) => (
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
            label="03 / Model Context Protocol — Community"
            title="MCP Servers."
            subtitle="MCP servers expose external tools to Claude via a standardized protocol. These run as local processes and work in both CC CLI and Claude Desktop, configured in separate JSON files for each platform."
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
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            label="04 / Dependencies"
            title="Prerequisites."
            subtitle="System-level tools required by the plugins and MCP servers above. The setup script handles all of these automatically."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prerequisites.map((tool, i) => (
              <ToolCard key={tool.tag} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* INSTALL CTA */}
      <section className="relative w-full py-32 px-8 md:px-16 border-t border-[var(--color-primary)]/10">
        <div className="download-cta max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <Wrench className="w-12 h-12 text-[var(--color-accent)] opacity-60" />
          <h2 className="font-serif italic text-4xl md:text-6xl">
            One Script. Everything.
          </h2>
          <p className="font-sans text-lg opacity-60 max-w-xl">
            Download the PowerShell setup script. It installs all prerequisites,
            enables every plugin, and configures MCP servers for both Claude Code
            CLI and Claude Code Desktop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="/setup-claude-extensions.ps1"
              download
              className="btn-magnetic px-10 py-5 bg-[var(--color-accent)] text-[var(--color-primary)] font-mono font-bold uppercase rounded-full flex items-center gap-3"
            >
              <span>Download Script</span>
              <Download className="w-5 h-5 relative z-10" />
            </a>
          </div>
          <div className="brutalist-card-dark p-6 text-left w-full max-w-xl mt-4">
            <div className="font-mono text-xs text-[var(--color-accent)] mb-3 uppercase">
              Usage
            </div>
            <pre className="font-mono text-sm opacity-70 whitespace-pre-wrap leading-relaxed">
{`# Run in PowerShell (elevated recommended)
.\\setup-claude-extensions.ps1

# Preview without changes
.\\setup-claude-extensions.ps1 -DryRun

# Skip specific sections
.\\setup-claude-extensions.ps1 -SkipPrereqs
.\\setup-claude-extensions.ps1 -SkipPlugins
.\\setup-claude-extensions.ps1 -SkipMCP`}
            </pre>
          </div>
        </div>
      </section>
    </main>
  )
}
