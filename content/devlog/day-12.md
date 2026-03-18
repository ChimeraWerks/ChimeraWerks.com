---
day: 12
date: "2026-03-17"
title: "The One Where I Reverse-Engineered Suno's Trash API (and Then Built Mobile)"
commitCount: 0
commits: []
---

Started the day wanting to fix one thing. A `data-ws-grid` attribute was missing from a div, which meant keyboard navigation couldn't detect how many columns the workspace grid had. Simple fix. Five minutes.

Then I tested it and noticed the Sync button on workspace cards was navigating you *into* the workspace instead of just syncing. So I fixed that. Then I realized there was no Sync All button on the workspace view. Obviously we need one. And a Download All button. With a WAV/MP3 toggle. And progress tracking. And pause.

This is how scope explosion works. You pull one thread and suddenly you're building a whole workspace management system.

The delete feature was fun to design. Three tiers of destruction: just wipe local data, also delete downloaded files, also trash everything on Suno. That third option is where it got interesting. Because Suno doesn't have a documented delete API. There's no public endpoint for it. You can trash songs in the web UI but the API calls are buried inside their bundled JavaScript.

So I went reverse-engineering. First attempt: intercept `window.fetch`. Didn't work — they bundle their own copy that bypasses any patches. Second attempt: `performance.getEntriesByType('resource')`. That one worked — shows every HTTP request regardless of how it was initiated. Found `POST /api/gen/trash`. Fetched their JavaScript bundle to find the request body format: `{trash: boolean, clip_ids: string[]}`. Songs go to a 30-day trash before permanent deletion.

Wired the whole thing up — batch trash in chunks of 50, a checkbox in the delete modal that says "Also trash all N songs on Suno" with a note about the 30-day recovery window. The confirm button changes text dynamically. Type DELETE to confirm.

---

Then the day took a completely different turn.

I opened the app on my phone. Just to check something quick. And it was... unusable. The desktop layout just shrinks down into this tiny mess of overlapping panels and truncated headers. The sidebar takes up half the screen, the resize handles are impossible to grab.

So I built a mobile foundation layer. From scratch. In one session.

Four new components. A responsive hook that detects mobile at 768px. A bottom tab bar with permission-filtered navigation. A compact header with action icon slots. A full-screen overlay that replaces sidebar panels.

Then I went through every single tab layout — Vault, Vision, Music, Forge — and added the mobile fork. Desktop code doesn't change at all. Side panels become overlay triggers. Footers hide. Resize handles disappear. The grid goes full-width. The Music player needed the most work — shrunk it, hid the volume slider (phones have hardware buttons for that), made the breadcrumb bar horizontally scrollable.

And then I added the Trader tab. Fifth section. Emerald green accent. The tab itself is still a scaffold but the shell integration is complete — header switcher, bottom nav, keyboard shortcuts, proxy configuration.

Documented everything — desktop UI conventions, mobile architecture, eleven rules for building new mobile features. Future me can add a new tab and get the mobile layout right on the first try.

Twelve days in and the app went from "desktop media browser" to a mobile-responsive platform with five sections. The scope keeps growing but the architecture keeps holding.
