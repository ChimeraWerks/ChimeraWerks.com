---
day: 14
date: "2026-03-20"
title: "The 40B Model That Fits on One GPU"
commitCount: 1
commits: ["203c487"]
---

Today was one of those days where you start with "let's load this quantized model" and end up building an entire UI architecture. But it all connected.

Remember the ChimeraQuant NVFP4 quantization pipeline from yesterday? Today I wrote the inference side — the part that actually loads those quantized weights and runs them at hardware FP4 speed. Built a custom module that replaces every quantized linear layer in the model with a version that quantizes activations on-the-fly and dispatches to Blackwell's FP4 tensor cores. 600 layers replaced, 1008 regular tensors loaded. The whole 40B model loads in about 14 seconds and fits in 25.6 GB of VRAM on the 5090.

Then I tried to actually chat with it and... yeah. That's when the scope expanded.

The existing chat was Vault-only, hidden in a right panel. I wanted something that works everywhere — every tab, same session, persistent. So I built a global console panel at the bottom of the screen. Like VS Code's terminal but for AI. Four views: local LLM chat, Claude Code terminal, split view (both side by side), and an activity feed. It sticks to the bottom, resizes with a drag handle, and persists when you switch tabs.

The Claude Code terminal piece was fun — a PTY manager that spawns shell processes, bridges them over WebSocket to xterm.js in the browser. Research I'd done earlier from five open-source CC embedding repos paid off. Knew exactly which gotchas to avoid.

Also built an OpenAI-compatible API at `/v1/chat/completions`. Any tool that speaks OpenAI format can now hit our local LLM as a drop-in replacement. No API keys, no per-token billing, just your own GPU.

And here's the game changer: the reverse tunnel. The cloudflared tunnel means that endpoint isn't just local. Remote machines, cloud workers, CI pipelines — anything that can make an HTTP request can use our 40B model sitting in VRAM at home. Your own private inference API, accessible from anywhere, running on hardware you own. No rate limits, no usage caps, no vendor lock-in.

Fifteen days in and Chimera Studio has its own brain now.
