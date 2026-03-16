---
day: 4
date: "2026-03-11"
title: "Music Gets Real + Going Remote"
commitCount: 2
commits: ["3093dcc", "5977e27"]
---

Needed the Music section to actually feel finished instead of "it works if you squint."

Added settings persistence so your audio directory and download preferences survive a server restart (you'd think that'd be day-one stuff but no, it was living in memory). WAV downloads with MP3 fallback. Live streaming playback so you can hear songs as they're being generated — there's this pulsing LIVE indicator that's honestly kind of satisfying to watch.

The fun part: mapped Suno's internal model IDs to human names. Nobody wants to see "chirp-crow" in their filter dropdown — it's "V5 (Crow)." Removed the Status filter entirely because every song is always "complete" by the time it's in our library. Useless filter.

Then I set up the Cloudflare tunnel. `--tunnel` flag on the launcher, cloudflared named tunnel, 16 workers. Now I can access the app from anywhere at `studio.chimerawerks.com`. Had to fight with regex anchoring in the cloudflared config — learned that lesson the hard way when requests were matching the wrong routes.

Favorites for both Vault and Music. Better default settings (panels open by default, reasonable volume, 1000 items per page). Caching headers on thumbnails. The kind of polish that makes the difference between "prototype" and "app."
