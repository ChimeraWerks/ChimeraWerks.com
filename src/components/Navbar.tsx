"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Navbar() {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top -50",
      end: 99999,
      toggleClass: { className: "nav-scrolled", targets: ".navbar" },
    })
    return () => trigger.kill()
  }, [])

  return (
    <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[90%] max-w-4xl rounded-full transition-all duration-300 border border-transparent">
      <a href="/" className="font-mono font-bold tracking-tight text-xl mix-blend-difference text-white logo-text">Chimera_Studio</a>
      <div className="hidden md:flex gap-6 text-sm font-sans mix-blend-difference text-white/70">
        <a href="/#features" className="hover:text-white transition-colors">Architecture</a>
        <a href="/#protocol" className="hover:text-white transition-colors">Protocol</a>
        <a href="/devlog" className="hover:text-white transition-colors">Devlog</a>
        <a href="https://studio.chimerawerks.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors font-bold tracking-wide">Live Demo</a>
      </div>
      <a href="mailto:hello@chimerawerks.com?subject=Chimera%20Studio%20Beta%20Access%20Request" className="px-5 py-2 text-sm font-bold bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full btn-magnetic inline-block">
        <span>Request Access</span>
      </a>
    </nav>
  )
}
