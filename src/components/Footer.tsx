export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-foreground)] text-[var(--color-primary)] px-8 md:px-16 pt-32 pb-16 relative z-10 border-t border-[var(--color-primary)]/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-sm">
            <h2 className="font-mono font-bold text-3xl mb-4 text-[var(--color-accent)]">Chimera_Studio</h2>
            <p className="font-sans opacity-60 mb-8 text-lg">Your local-first intelligence hub for ComfyUI outputs and AI music generation.</p>
            <div className="flex items-center gap-3 font-mono text-sm px-4 py-2 border border-[var(--color-primary)]/20 rounded-full inline-flex">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 font-mono text-sm">
            <div className="flex flex-col gap-4">
              <span className="opacity-40 uppercase mb-2">Platform</span>
              <a href="https://github.com/ChimeraWerks/ChimeraStudio" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">Documentation</a>
              <a href="https://github.com/ChimeraWerks/ChimeraStudio" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">GitHub</a>
              <a href="https://github.com/ChimeraWerks/ChimeraStudio/releases" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">Releases</a>
              <a href="/devlog" className="hover:text-[var(--color-accent)] transition-colors">Devlog</a>
              <a href="/toolkit" className="hover:text-[var(--color-accent)] transition-colors">Toolkit</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="opacity-40 uppercase mb-2">Legal</span>
              <a href="/privacy" className="hover:text-[var(--color-accent)] transition-colors">Privacy</a>
              <a href="https://github.com/ChimeraWerks/ChimeraStudio/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">License</a>
            </div>
          </div>
        </div>

        <div className="mt-32 border-t border-[var(--color-primary)]/10 pt-8 flex justify-between font-mono text-xs opacity-30 uppercase">
          <span>&copy; 2026 Chimera Werks</span>
          <span>Local Database Authorized</span>
        </div>
      </div>
    </footer>
  )
}
