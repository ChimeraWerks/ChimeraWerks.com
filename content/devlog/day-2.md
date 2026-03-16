---
day: 2
date: "2026-03-09"
title: "Making Filters Actually Smart"
commitCount: 4
commits: ["9aa9251", "9ccbb52", "b07334e", "869e00e"]
---

The basic filters worked but they felt dumb. You'd select a model and then the LoRA dropdown would still show every LoRA in the database, even ones that were never used with that model. That drove me crazy.

So I built cascading filters — when you pick a model, every other filter narrows down to only show values that actually exist with that selection. It sounds simple but the implementation required rethinking how every filter query works. Each category has to exclude *itself* when computing what's available in the other categories, otherwise you get circular dependencies.

Also got nerdsniped by the port situation. I have multiple apps across the ChimeraWerks ecosystem and they were all fighting over random ports. Ended up designing a whole port convention — `2XYZZ` scheme where X identifies the app, Y identifies the layer, ZZ is the instance. Maybe overkill for a solo dev, but I like things organized.

Other stuff that landed:
- Subfolder browsing with a tree UI — can drill into nested output folders
- Date range filters
- Model name dedup (you'd be surprised how many ways the same model can show up depending on whether the path used forward or back slashes)
- A shared video element that gets reparented between the info panel and the modal — one `<video>` DOM node, seamless playback, no gap
- Video settings: autoplay, loop, volume, spacebar play/pause

The video thing was satisfying. Click a video in the grid, it shows in the side panel. Open the modal, the exact same video element moves over — no reload, no sync issues. Close the modal, it goes back. Smooth.
