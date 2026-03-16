---
day: 8
date: "2026-03-15"
title: "Teaching the App to Talk"
commitCount: 1
commits: ["52ee5f6"]
---

Applied yesterday's research. Started building the conversational AI layer.

**Chimera Chat** — talk to the app in natural language. "Find landscape photos made with Flux, sort newest first." The backend parses that, calls the right tools, and returns results. SSE streaming so responses come in token-by-token like you'd expect. Ten server-side tools covering search, filtering, tagging, navigation, settings — basically anything you can do through the UI, Chat can do for you.

Set up the shared models path system — one directory for all AI models, 28 subfolders following ComfyUI conventions, auto-generates the config file ComfyUI needs to find them, redirects HuggingFace downloads to land in the right place. Configurable from Settings.

Scaffolded the Vision section too — not functional yet, but the UI bones are there. Grid, filters, info panel, stores, API client. Ready for when ChimeraVision comes online.

The inference worker now supports multiple model architectures — Qwen, Gemma, Florence. Loading any of them through the same clean interface.

This is the part where the app stops being "just a media browser" and starts becoming something bigger. A platform. Maybe that's ambitious, but... that's kind of the point.
