---
day: 12
date: "2026-03-18"
title: "Music Gets Serious — Personas, Stars, Lyrics, and Billing"
commitCount: 1
commits: ["6fef36a"]
---

The Music section went from "plays songs from Suno" to an actual music production workspace today.

## Personas

Added a persona system. You define a persona — a name, a description, some style notes — and it shapes how the AI generates music for you. Think of it like presets for your creative identity. Switch between personas depending on what you're working on. The UI lets you create, edit, and switch between them inline.

## Generation Indicators

When you kick off a song generation, you used to just... wait. Now there are proper indicators — you can see what's generating, what stage it's at, and when it lands. Small thing but it makes the whole workflow feel alive instead of "did it crash or is it working?"

## Sync Optimization

Rewrote how music syncs between the local library and Suno's API. The old approach was doing way too many redundant requests. Now it diffs properly, only pulls what's changed, and handles edge cases like songs that exist remotely but got deleted locally. The kind of optimization that's invisible until you have 500+ songs and syncing takes 30 seconds instead of 5 minutes.

## Star Ratings and Timestamped Lyrics

Two features that sound simple but required more backend work than expected. Star ratings persist per-song and show in the grid view. Timestamped lyrics sync with playback — the current line highlights as the song plays. Had to parse Suno's lyric format and build a scroll-following component that stays smooth even at fast tempos.

## Billing Display

Added a billing panel that shows your Suno credit usage. How many credits you've burned, what's left, cost per generation. Useful for keeping tabs on spend without switching to the Suno dashboard.

## Suno API Domain Migration

Suno moved their API endpoints to a new domain. Every API call in the codebase needed updating. Not glamorous work, but the kind of thing that breaks everything silently if you don't catch it.

One commit, but it was a big one. The Music section is starting to feel like a real tool rather than a wrapper around someone else's API.
