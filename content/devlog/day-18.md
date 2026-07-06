---
day: 18
date: "2026-03-22"
title: "Roleplay, Discord, SecOps Scaffold"
commitCount: 1
commits: ["2da570c"]
---

This session started with "how does Anthropic's Discord plugin work" and ended twelve hours later with a fully operational Discord server, a Python port of their entire channel bridge, a persona framework, and an architectural plan for monetizing private AI roleplay rooms. The scope creep was... aggressive.

The port itself was maybe 300 lines of Python. The hard part was Windows. `asyncio.connect_read_pipe` on stdin doesn't work on the ProactorEventLoop — just throws `OSError: [WinError 6] The handle is invalid`. Needed a thread-based stdin reader instead. One of those things that works perfectly on every OS except the one you're actually using.

Then the batch file saga. Should be simple, right? Just the launch script with extra flags. Except `--channels` needs `--dangerously-load-development-channels` because custom MCP servers aren't on the approved allowlist. And that flag needs an argument. And there's an interactive prompt you have to press 1 on. And the plugin system doesn't trust local marketplaces for channels. Six versions of that batch file before it worked.

But then — it worked. DM'd the bot on Discord, watched the message appear in my Claude Code session, Claude responded, reply showed up in Discord. That moment was genuinely cool. A bridge between two worlds.

Then things got interesting.

The persona research went deep. Not just "make Claude talk differently" but actually engineering human-like AI characters. SOUL.md, SoulSpec, PersonaNexus, Anthropic's own soul document — there's a whole ecosystem of persona definition frameworks out there. SoulSpec's file structure maps almost perfectly to what I needed. And after all that research, the config addition ended up being three lines. Three. But precisely the right three lines.

Then I pivoted to the server itself. Installed a discord-admin MCP — 139 Discord admin tools accessible from Claude Code via natural language. "Create a role called Insider with deep purple color." "Create a category called THE PARLOR." Just talking to Claude and watching my Discord server materialize in real time. Eight categories, 25 channels, 6 roles, full permission hierarchy, embedded welcome messages, a verify reaction that auto-assigns the Member role. Never touched the Discord UI once.

The architecture came together around a metaphor I couldn't shake: a brothel inside a Discord server. A professional company hub on the surface, with a hidden trapdoor to a private space full of AI-powered rooms. Each room has a persona waiting. Each customer gets their own private thread — invisible to everyone else. The parlor is the lobby you discover when you're granted Insider access. The rooms behind it are individually gated.

Session isolation was the hardest design problem. The channel bridge is single-session — all messages share one context. Customer 1 trying to seduce Ava while Customer 2 is fighting trolls with her... that would not work. The solution: one Claude CLI process per active thread. Idle sessions get reaped, resumed on return via `--resume`. Conversation history logged to SQLite for re-injection when context gets compressed. Plus a full bot operations database — registry, session lifecycle, logging, analytics, timed access for monetization. It's basically the backend for running AI personas as a service.

Oh, and somewhere in the middle of all this, the SecOps cockpit got scaffolded too. Different session, same commit. API endpoints for engagements, hooks, VPN. A flow engine that runs declarative YAML-based pentesting workflows. FlowTreePanel, StepCard, the whole frontend skeleton.

63 files changed. 12,537 lines added. Eight research documents. One Discord server built from scratch. One channel bridge ported from TypeScript to Python. One SecOps cockpit scaffolded.

I'm building a product. I didn't realize that until about hour eight of this session, but... I'm building a product.
