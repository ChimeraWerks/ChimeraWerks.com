const REPO_URL = "https://github.com/ChimeraWerks/ChimeraStudio/commit"

export function CommitBadge({ hash }: { hash: string }) {
  return (
    <a
      href={`${REPO_URL}/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center font-mono text-xs px-3 py-1.5 rounded-full border border-[var(--color-primary)]/20 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
    >
      {hash.slice(0, 7)}
    </a>
  )
}

export function CommitBadges({ commits }: { commits: string[] }) {
  if (!commits.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-[var(--color-primary)]/10">
      <span className="font-mono text-xs opacity-50 uppercase mr-2 self-center">Commits</span>
      {commits.map((hash) => (
        <CommitBadge key={hash} hash={hash} />
      ))}
    </div>
  )
}
