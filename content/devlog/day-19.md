---
day: 19
date: "2026-03-22"
title: "The One Where the Cockpit Actually Flies"
commitCount: 0
---

So yesterday I scaffolded the SecOps cockpit. Flow tree, step cards, simulation data. It looked nice but it didn't... do anything. Today I made it real.

The core idea is stupid simple: you click a button in the cockpit, and Claude Code runs the command in a terminal. That's it. But making "that's it" actually work required wiring up PTY sessions, prompt injection, CC hooks, event feeds, auto-completion, context chaining... turns out "simple" had about eight layers.

First problem: getting the prompt into CC. Wrote it to the PTY stdin and... nothing happened. CC showed the text but didn't process it. Turns out terminal emulators want `\r` for Enter. Not `\n`. Not `\r\n`. Just `\r`. One character difference, two hours of debugging.

Then the conda thing. CC decided to activate conda inside every Bash command even though conda was already active in the terminal. Because I had "Activate: `conda activate ai`" in the project instructions. CC was following instructions I wrote. Removed two lines, problem solved. Sometimes the bug is in the docs.

Then I built the event feed wrong. Made it a syslog — tiny timestamped text lines. There was a 650-line UI research document with Palantir and Bloomberg design patterns sitting in the docs folder that I didn't read. Built the whole thing from scratch instead. Had to redo it.

Then the black screen saga. Partial code revert, stale browser cache, wrong tab in the screenshot tool, Zustand store mismatch... a perfect storm of cascading debugging failures. Lost all my work, rebuilt from scratch.

But the rebuild went clean. The cockpit actually works now. Click "Detect WAF" and CC runs wafw00f. Watch it happen in real-time. Events appear in the feed. Step auto-completes. Findings extracted. Next step gets prior context. It's real.

VPN indicator in the header shows Mullvad status. Context panel has tabs for Findings, Docs, and Tools. Steps can be re-run. Prior engagement data persists. Back button to switch targets.

Still needs the full UI overhaul — the research doc describes a military command center aesthetic that I haven't achieved yet. And the flow tree is still static. But the bones work. The cockpit flies.

Didn't commit today. Everything is live but uncommitted. Next session starts with a clean commit.
