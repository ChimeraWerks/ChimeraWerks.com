---
day: 13
date: "2026-03-19"
title: "Live Market Data and a Discord Ghost Story"
commitCount: 4
commits: ["b5ff56f", "bace758", "2c23f87", "7a39dab"]
---

The Trader tab stopped using fake data today.

## Webull Live Market Data

Wired up real market data from Webull's SDK. This was the part where the Trader tab went from "cool prototype with static charts" to "holy crap, those are real prices moving in real time." Had to fix the SDK's auth flow — their token refresh was silently failing, so after an hour the data stream would just stop. Traced it to a session cookie that wasn't being persisted between restarts. Now it reconnects cleanly.

The price chart updates live now. Candlesticks forming in real time. Quote data streaming into the detail panel. It's the kind of thing that makes you sit there and just... watch it for a while.

Also wrote up an API reference doc for the Webull integration, because future-me debugging auth issues at 2am will need it.

## Documentation Catch-Up

Updated the LDD (living design document) with the full Trader subsystem architecture — Webull integration details, safety layers, charting stack. Updated the README too — added Trader features, Discord bot info, new stack additions, and revised the project structure section. The kind of documentation work that's boring to do but saves hours when you're onboarding your own brain six months from now.

## The Discord Ghost

This one was weird. The Discord bot was registering slash commands twice — once globally and once per-guild. Which meant every command showed up as a duplicate in the command list. Users would see two `/play` commands and have to guess which one worked. (Both did, technically, but the global ones took up to an hour to propagate while the guild ones were instant.)

The fix was simple once I found it: clear global commands before syncing guild-specific ones. But tracking down *why* it was happening took longer than the fix. Discord's command registration API is one of those things that works fine until it doesn't, and when it doesn't, the error messages are spectacularly unhelpful.

Four commits. The Trader tab is starting to feel real, the docs are caught up, and the Discord bot stopped seeing double.
