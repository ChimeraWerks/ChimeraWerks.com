---
day: 6
date: "2026-03-13"
title: "ChimeraCore — Giving the App a Brain"
commitCount: 1
commits: ["bd0dbef"]
---

This is where it gets interesting. Everything up to now was about *organizing* AI content. Now the app itself is becoming AI-powered.

Built ChimeraCore — the inference engine. It runs AI models in a separate subprocess so if something crashes (and GPU stuff crashes), it doesn't take down the whole server. Kill the process and VRAM is guaranteed freed. The worker talks to the main server over a JSON line protocol on stdin/stdout.

The implementation was tricky:
- Auto-detects your GPU and picks the right precision (bf16 on newer cards, fp16 otherwise)
- Tries multiple attention acceleration backends and falls back gracefully
- Optional compile mode for long-running workers
- Warms up the GPU with dummy passes before the first real request (cold GPUs are slow)
- Auto-unloads models when idle so your VRAM isn't held hostage
- If it crashes, it restarts itself with backoff so it doesn't spam restart attempts

Also built a hardware profiler that detects everything about your system — OS, CPU, GPU, RAM, Python version, installed AI packages, ComfyUI install location, the works. Served it through an API and added a UI panel in Settings.

And a CLI test tool so I can benchmark captioning speeds without starting the whole web server. Very useful for profiling.
