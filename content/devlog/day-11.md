---
day: 11
date: "2026-03-17"
title: "Browse Mode, Suno Trash API, Mobile Foundation, Trader Tab"
commitCount: 11
commits: ["faa57e7", "c5f8d21", "d41a1d0", "69a8046", "7419921", "dd31f2d", "cb616f3", "673d59d", "038104d", "6b9f90d", "d772aad"]
---

This was supposed to be a one-feature day. "Add a Browse mode so users can see their full Suno library without syncing everything first." Simple concept. It was not a one-feature day.

## Browse Mode

Built the whole thing — workspace picker that shows all your Suno projects, click one to browse its songs remotely, stream audio directly from Suno's CDN without downloading, grab individual songs or bulk sync everything. List view, grid view, info panel with all the metadata. It's a proper two-pane browser for your remote music library.

That part went fine. The frustrating part was everything after.

Download buttons silently failing. Three bugs stacked on top of each other — the backend returning "already exists" for synced songs with no audio files, the feed API 404'ing because workspace endpoints don't return clips, and WAV conversion returning empty bodies that my JSON parser choked on. Three bugs. One silent failure.

Then WAV downloads. Suno doesn't just give you a WAV file — you trigger a conversion, then poll the CDN every few seconds until it shows up. About 30 seconds per song. Someone tries to download 100 songs as WAV, that's 50 minutes. Had to add rate limiting, time estimates, a confirmation dialog for bulk downloads.

## Reverse-Engineering Suno's Trash API

Then scope explosion. The Sync button on workspace cards was navigating instead of syncing. Fixed that. Then realized we need Sync All. And Download All. With WAV/MP3 toggle. And progress tracking.

The delete feature is where it got interesting. Three tiers of destruction: wipe local data, also delete downloaded files, also trash everything on Suno. That third option required reverse-engineering — Suno doesn't have a documented delete API. First attempt: intercept `window.fetch`. Didn't work — they bundle their own copy that bypasses patches. Second attempt: `performance.getEntriesByType('resource')`. That worked — shows every HTTP request regardless of how it was initiated. Found `POST /api/gen/trash`. Fetched their JavaScript bundle for the request body format: `{trash: boolean, clip_ids: string[]}`. Songs go to a 30-day trash before permanent deletion.

Wired up batch trash in chunks of 50, a checkbox in the delete modal that says "Also trash all N songs on Suno" with a note about the 30-day recovery window. Type DELETE to confirm.

## Mobile Foundation

Then the day took a completely different turn. I opened the app on my phone. It was unusable. Desktop layout shrunk into a mess of overlapping panels and truncated headers.

So I built a mobile foundation layer from scratch. Four new components — a responsive hook that detects mobile at 768px, a bottom tab bar with permission-filtered navigation, a compact header with action icon slots, and a full-screen overlay that replaces sidebar panels. Went through every tab layout and added the mobile fork. Desktop code doesn't change at all. Side panels become overlay triggers. Footers hide. Resize handles disappear. The Music player needed the most work — shrunk it, hid the volume slider (phones have hardware buttons), made the breadcrumb bar scrollable.

## Trader Tab

And then I added the Trader tab. Fifth section. Emerald green accent. Wired the ChimeraTrader backend into the launcher, added TradingView lightweight-charts with candlestick rendering, real-time quotes, a settings modal, and header polish. Built trading safety layers — paper mode as default, a live confirmation gate, and an emergency kill switch (cancel all orders, halt trading, Ctrl+Shift+X).

Documented everything — desktop UI conventions, mobile architecture, eleven rules for building new mobile features. Future me can add a new tab and get the mobile layout right on the first try.

Eleven commits. The app went from "desktop media browser" to a mobile-responsive platform with five sections and a built-in trading terminal. The scope keeps growing but the architecture keeps holding.
