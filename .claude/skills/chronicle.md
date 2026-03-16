---
name: chronicle
description: Append a new development day entry to the devlog across all three locations — the website content files, ChimeraStudio CHRONICLE.md, and ChimeraStudio DEVLOG.md
user_invocable: true
---

# /chronicle — Update All Devlogs

Appends a new day entry documenting development progress across three locations with different audiences and voices.

## Destinations

| File | Voice | Audience |
|------|-------|----------|
| `content/devlog/day-N.md` (this repo) | Raw, personal, first-person | Website visitors reading the devlog |
| `c:\Github\ChimeraStudio\CHRONICLE.md` | Professional, declarative, no emotions | Investors, portfolio visitors, collaborators |
| `c:\Github\ChimeraStudio\DEVLOG.md` | Casual, stream-of-consciousness | Dev community, indie dev fans |

## Process

1. **Read existing entries** in all three locations. Study the last 2-3 entries to match voice, length, formatting, and detail level. The existing entries ARE the style guide.

2. **Get recent git history** from BOTH repos:
   ```bash
   cd c:/Github/ChimeraWerks.com && git log --format="%h|%ad|%s" --date=short
   cd c:/Github/ChimeraStudio && git log --format="%h|%ad|%s" --date=short -10
   ```

3. **Determine day number** — increment from the last day in the existing entries. Only create one entry for today.

4. **Ask the user**: "Anything you want me to include in the devlog? Thoughts, feelings, frustrations, wins — anything personal about this session?"

5. **Write the website devlog entry** (`content/devlog/day-N.md`):
   - YAML frontmatter with day, date, title, commitCount, commits array
   - Content matches the DEVLOG.md voice (raw, personal)
   - No trade secrets (see filter list below)

6. **Write the CHRONICLE.md entry** (in ChimeraStudio repo):
   - Append BEFORE `## Project Stats`
   - Professional voice, `**What shipped:**` bullet list format
   - Concrete numbers, declarative sentences, active voice
   - Update the Project Stats table (day count, commit count, coding days)

7. **Write the DEVLOG.md entry** (in ChimeraStudio repo):
   - Append BEFORE `## What's Coming`
   - Casual stream-of-consciousness voice
   - Uses ellipsis, fragments, contractions, rhetorical questions
   - Include user's personal thoughts from step 4

8. **Update the website**:
   - Add the day to the `DAYS` array in `src/components/DevlogTeaser.tsx`
   - Bump `grid-cols-N` in the same file (3 occurrences)
   - Add URL to `public/sitemap.xml`

9. **Commit both repos** and push to trigger auto-deploy.

## Entry Format

### Website (content/devlog/day-N.md)
```markdown
---
day: N
date: "YYYY-MM-DD"
title: "Short Catchy Title"
commitCount: X
commits: ["hash1", "hash2"]
---

Content in casual first-person voice...
```

### CHRONICLE.md
```markdown
---

## Day N — Month DD, YYYY

### Short Milestone Title

Description of what was built and why it matters.

**What shipped:**

- Feature one
- Feature two
- **Bold feature**: with description

**Commits:** [`hash1`](https://github.com/ChimeraWerks/ChimeraStudio/commit/hash1) [`hash2`](url)
```

### DEVLOG.md
```markdown
---

## Day N — Month DD, YYYY

### Catchy Personal Title

Casual narrative content...

**Commits:** [`hash1`](https://github.com/ChimeraWerks/ChimeraStudio/commit/hash1)
```

## Commit Links

- ChimeraStudio commits: `https://github.com/ChimeraWerks/ChimeraStudio/commit/{hash}`
- ChimeraWerks.com commits: `https://github.com/ChimeraWerks/ChimeraWerks.com/commit/{hash}`

## Trade Secrets — NEVER Leak in Devlog

Safe to mention: what features do, why they matter, how they feel, that they were hard, performance numbers.

Never reveal implementation details for:
- ComfyUI graph traversal algorithm and TYPE_COMPAT system
- Node registry architecture / declarative handler pattern
- GetNode/SetNode virtual connection resolution
- Cascading filter exclude-self algorithm
- Shared `<video>` DOM reparenting technique
- Inference worker JSON line protocol details
- stdin buffering strategy
- SageAttention fallback chain logic
- Ready signal handshake in subprocess communication
