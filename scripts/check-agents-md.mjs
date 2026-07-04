#!/usr/bin/env node
// Gate check for the repo's instruction architecture (see instruction-policy.md).
// Enforces the mechanical half of the policy: root line cap, referenced-path existence,
// and banned generic phrases. Judgment (admission test, scar quality) stays with agents.
//
//   node scripts/check-agents-md.mjs [--root <repo-root>] [--cap <lines>] [--word-cap <words>]
//
// Exit 0 = pass. Exit 1 = violations, listed one per line on stdout as `FAIL <rule>: <detail>`.
// Read-only and idempotent. Unknown flags fail loudly so a typo cannot silently widen scope.
// Size is ADVISORY, never a failure: the doctrine's budget is the admission test, not a number —
// a long file where every line earns its load is correct. Past the review thresholds the gate
// prints WARN lines prompting an audit; only mechanical truths (dead routes, banned phrases) fail.

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const args = process.argv.slice(2)
let root = process.cwd()
let cap = 120
let wordCap = 1500
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') root = resolve(args[++i] ?? root)
  else if (args[i] === '--cap') cap = Number(args[++i] ?? cap)
  else if (args[i] === '--word-cap') wordCap = Number(args[++i] ?? wordCap)
  else {
    console.log(`FAIL usage: unknown flag "${args[i]}". Valid flags: --root <repo-root>, --cap <lines>, --word-cap <words>.`)
    process.exit(1)
  }
}

const failures = []
const warnings = []
const agentsPath = join(root, 'AGENTS.md')
if (!existsSync(agentsPath)) {
  console.log(`FAIL missing: ${agentsPath} not found. Run the agents-md skill's init mode to create it.`)
  process.exit(1)
}
const text = readFileSync(agentsPath, 'utf8')
const lines = text.split(/\r?\n/)

const words = text.split(/\s+/).filter(Boolean).length
if (lines.length > cap) {
  warnings.push(`size: AGENTS.md is ${lines.length} lines (review threshold ${cap}). Growth usually carries sediment — run the agents-md skill's audit mode. Not a failure; a long file where every line passes the admission test is correct.`)
}
if (words > wordCap) {
  warnings.push(`size: AGENTS.md is ${words} words (review threshold ${wordCap}). Same as above — audit, don't cram or drop real scars.`)
}

// Generic virtue phrases say nothing a frontier model does not already do; they only spend context.
const banned = ['best practice', 'write clean code', 'be careful', 'high-quality code', 'follow good']
const lower = text.toLowerCase()
for (const phrase of banned) {
  if (lower.includes(phrase)) failures.push(`banned-phrase: "${phrase}" found. Replace with a concrete rule or delete.`)
}

// Every repo-relative .md path the file references must exist; a dead routing line strands the lazy tier.
const seen = new Set()
for (const match of text.matchAll(/(?:\]\(|`)([^)`\s:*<>"']+\.md)(?:\)|`)/g)) {
  const ref = match[1]
  // `@AGENTS.md` and friends are harness import directives (the CLAUDE.md bridge syntax), not filesystem
  // routes. Without this skip, any AGENTS.md that documents its own bridge dead-routes its own gate —
  // found by the Chimera-Souls audit on first contact.
  if (ref.startsWith('http') || ref.startsWith('#') || ref.startsWith('@') || seen.has(ref)) continue
  seen.add(ref)
  if (!existsSync(join(root, ref))) failures.push(`dead-route: referenced path "${ref}" does not exist. Fix the path or create the doc in the same commit.`)
}

for (const w of warnings) console.log(`WARN ${w}`)
if (failures.length === 0) {
  console.log(`PASS AGENTS.md: ${lines.length} lines / ${words} words (review thresholds ${cap}/${wordCap}), ${seen.size} routed paths verified, 0 banned phrases${warnings.length ? `, ${warnings.length} advisory warning(s)` : ''}.`)
  process.exit(0)
}
for (const f of failures) console.log(`FAIL ${f}`)
console.error(`agents-md gate: ${failures.length} violation(s). Policy: see the instruction-policy doc routed from AGENTS.md.`)
process.exit(1)
