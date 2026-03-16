---
day: 1
date: "2026-03-08"
title: "There Has to Be a Better Way"
commitCount: 4
commits: ["f1f5270", "397c928", "485bccb", "fa93d91"]
---

So I had this folder with like 3,000+ images and videos just... sitting there. Every time I wanted to find something specific — "which workflow used that LoRA at 0.8 with DPM++ 2M?" — I'd end up opening files one by one. Scrolling through thumbnails for 20 minutes hoping I'd recognize the right one.

I kept thinking "there has to be a better way" and honestly... there wasn't. I looked at everything. Eagle, Allusion, digiKam, XnView, Hydrus — none of them understood ComfyUI's embedded workflow data. The metadata is right there *inside* the files, locked away because nobody wrote a proper parser for it.

So I just started building.

- Wrote the backend in Python — FastAPI, SQLAlchemy, SQLite. Nothing fancy, just solid
- Built extractors that can crack open PNGs, MP4s, and WebPs to pull out their hidden metadata
- The big one: a ComfyUI workflow parser. ComfyUI doesn't store metadata in a nice flat format — it stores the entire node graph. So I had to write something that could walk the graph, understand 60+ different node types, and decompose all of that into clean searchable fields
- Threw together a React frontend with a virtualized thumbnail grid because... 3,000+ items, you need virtualization or your browser just dies
- Added 18 different filter parameters. Model, LoRA, sampler, scheduler, prompt search, seed, resolution, date range... the works
- Saved searches, keyboard shortcuts, settings that persist

Pointed it at my output folder. 3,272 files ingested. 689 came back with fully parsed ComfyUI metadata — prompts, models, samplers, LoRA weights, all of it. Searchable. Filterable.

I couldn't stop adding features. By the end of the night I had scan completion summaries, orphan cleanup for deleted files, incremental scanning so re-scans are fast... I think I committed four times that day.
