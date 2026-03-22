---
day: 17
date: "2026-03-22"
title: "The Session That Wouldn't End, and Then the Security Panic"
commitCount: 1
commits: ["75d6c21"]
---

Two sessions today. The first one was the terminal rewrite from hell. The second one was me realizing my entire app was exposed to the internet with... let's say, some gaps.

The terminal story first. Went in thinking "quick session, add some xterm addons." Eight hours later I'm debugging why every other character shows up as a white rectangle. Every typed character followed by a corrupted escape sequence.

Turns out I'd added a "reconnect to existing session" feature that was too smart for its own good. Two browser tabs open, both finding the same PTY session, both opening WebSockets, both creating separate read loops on the same pipe. Two concurrent reads, each grabbing random chunks. Escape sequences torn in half.

Before I found that, I blamed the WebGL renderer, the Canvas renderer (which doesn't exist in xterm v6 — they removed it entirely), the Vite cache, the output buffer, the addons... ripped everything out one by one for over an hour. The fix was one line. Remove reconnect, always create new sessions.

Then multi-tab just worked. Tab bar, create/close/rename, independent PTY sessions per tab. Seven bugs in one session, each fix creating the next. But by the end: production-grade multi-tab terminal.

Then the second session happened.

I'd just added a functional CLI terminal and a daytrader tab to an app that's exposed on the internet through a Cloudflare tunnel. And I had this moment of "wait... how secure is this actually?"

The first audit found real problems. The terminal WebSocket was essentially unauthenticated — Starlette's BaseHTTPMiddleware just doesn't intercept WebSocket connections. Nobody tells you this. The Trader backend was wide open — zero auth, Swagger docs enabled, CORS set to wildcard. Accessible through the tunnel. And the main app's Swagger docs were enabled too — a complete blueprint of every endpoint, just sitting there for anyone.

The fix session was intense but clean. Built WebSocket auth helpers. Added a `terminal.access` permission gated on all terminal routes. Built JWT verification for the Trader using stdlib-only HMAC. Locked CORS to explicit origins. Added login rate limiting. Disabled Swagger everywhere. Went through and added permission checks to 35+ endpoints that were relying on just the cookie check.

The attack chain to reach the terminal is now four layers deep. The permission editor in the Accounts tab went from a flat checkbox list to 8 organized categories with 17 permissions.

It's the kind of work that doesn't feel like progress because nothing looks different in the UI. But the difference between "my app is on the internet" and "my app is secure on the internet" is everything. Especially when that app has a terminal that can run arbitrary commands on my PC.

Seventeen days in. 160+ API endpoints and every single one checks who you are and what you're allowed to do.
