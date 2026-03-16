import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy",
  description: "Chimera Studio privacy policy. Your data stays on your machine.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-foreground)] text-[var(--color-primary)] pt-32 pb-32">
      <article className="max-w-2xl mx-auto px-8">
        <h1 className="font-serif italic text-4xl md:text-5xl mb-8">Privacy</h1>

        <div className="font-sans text-base leading-relaxed space-y-6 opacity-80">
          <p>
            Chimera Studio is a <strong className="text-[var(--color-accent)]">local-first</strong> application. It runs entirely on your machine.
          </p>

          <p>
            We do not collect, store, transmit, or process any of your personal data, media files, metadata, or usage analytics. There are no tracking pixels, no telemetry, no third-party analytics scripts.
          </p>

          <p>
            Your images, videos, audio files, and all extracted metadata remain on your local filesystem and in your local SQLite databases. Nothing leaves your machine unless you explicitly choose to enable remote access via Cloudflare tunnel, in which case the connection is between your devices only.
          </p>

          <h2 className="font-serif italic text-2xl mt-12 mb-4 text-[var(--color-primary)]">This Website</h2>

          <p>
            This marketing website (chimerawerks.com) is a static site. It does not use cookies, does not collect analytics, and does not track visitors. The only data exchange occurs if you choose to email us via the contact links.
          </p>

          <h2 className="font-serif italic text-2xl mt-12 mb-4 text-[var(--color-primary)]">Contact</h2>

          <p>
            Questions about privacy? Reach out at{" "}
            <a href="mailto:hello@chimerawerks.com" className="text-[var(--color-accent)] hover:opacity-70 transition-opacity">
              hello@chimerawerks.com
            </a>
          </p>
        </div>
      </article>
    </main>
  )
}
