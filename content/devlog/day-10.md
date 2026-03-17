---
day: 10
date: "2026-03-16"
title: "The Boring Day (That Wasn't)"
commitCount: 2
commits: ["d2d3d69", "9ba5a1e"]
---

Every project hits a point where you look at your codebase and go "okay, this is getting messy." Day 10 was that day.

I had the same CollapsibleSection pattern copy-pasted across like six different panels. Same resize handle component duplicated in three sections. Format constants defined in six different files. It works, but it's the kind of tech debt that compounds fast.

So I cleaned house. Built a proper shared CollapsibleSection component with persistent collapse state — click a section closed, refresh, it stays closed. Applied it everywhere. Extracted all the duplicated code into shared modules. Deleted the copies.

Also modernized all the Python typing. `Optional[str]` → `str | None`. It's 2026, we can use the modern syntax.

Not a flashy day. No screenshots, no "look what I built." But the codebase went from "it works if you don't look too closely" to "yeah, this is actually organized." The kind of work that makes tomorrow's feature easier to build.

Two commits. Clean ones.
