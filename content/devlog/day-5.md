---
day: 5
date: "2026-03-12"
title: "The Infrastructure Day"
commitCount: 7
commits: ["f78ad7c", "50f6f50", "2bb60a0", "dc8f95e", "20e435f", "7170552", "190daa0"]
---

Some days are about flashy features. This was about making the thing actually deployable and secure.

Clipboard copy — highlight a prompt, copy it. Click a field, copy it. Select an image, copy it to clipboard as PNG. Sounds simple, took more code than you'd think (Canvas API → PNG → Clipboard API for images). Bulk tagging with autocomplete. Shadow metadata so users can override parsed fields without touching the original data.

Then the big one: authentication. JWT with bcrypt, httpOnly cookies, role-based access control. Admin, editor, viewer roles with per-user permission overrides. User management UI. This was... a lot. But if the app is going to be accessible over a tunnel, it needs auth. No shortcuts.

Built `ctl.py` — a standalone process controller that can stop, start, restart, and monitor the entire stack. Uses port scanning to find processes, works even after crashes. Admin buttons in Settings so you can restart the server from the UI. Added Claude Code skills so I can say `/restart` during development instead of manually killing processes.

Seven commits that day including some annoying logo fixes. Turns out when you use a 64px favicon as your 288px hero image... it's blurry. Who knew.
