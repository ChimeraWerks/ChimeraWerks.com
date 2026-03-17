---
day: 11
date: "2026-03-17"
title: "Browse Mode and the WAV Rabbit Hole"
commitCount: 0
commits: []
---

This was supposed to be a straightforward feature day. "Add a Browse mode so users can see their full Suno library without syncing everything first." Simple concept, right?

The concept was simple. The execution... was not.

Built the whole thing — workspace picker that shows all your Suno projects, click one to browse its songs remotely, stream audio directly from Suno's CDN without downloading, download individual songs or bulk sync everything. List view, grid view, info panel with all the metadata. It's a proper two-pane browser for your remote music library.

That part went fine. The frustrating part was everything after.

First the download button just... silently failed. No error in the UI, no feedback, just nothing. Dug into it and found three bugs stacked on top of each other. The backend was returning "already exists" for synced songs that had no audio files. The feed API doesn't return clips from workspace endpoints so the metadata lookup was 404'ing. And the WAV conversion endpoint returns an empty body, which my JSON parser obviously choked on. Three bugs. One silent failure. Fun.

Then WAV downloads. Suno doesn't just give you a WAV file — you trigger a conversion, then poll the CDN every few seconds until it shows up. About 30 seconds per song. If someone tries to download 100 songs as WAV... that's 50 minutes. Had to add rate limiting safeguards, time estimates in the UI, a confirmation dialog for bulk downloads. The kind of UX you don't think about until someone actually tries it.

And then the UI inconsistencies started piling up. The model field showing raw internal IDs instead of friendly names. The Library showing WAV files as MP3s because a database column was defaulting wrong. The download button disabling itself after downloading MP3 even when the user wanted WAV. Each fix was small but tracking them down was... exhausting. You fix one thing and two more inconsistencies pop up.

No commits yet. It's past midnight and I've been chasing UI inconsistencies for hours. But Browse mode works. Finally.
