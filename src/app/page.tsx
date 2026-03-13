"use client"

import React, { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Database, Activity, Lock, ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const DiagnosticShuffler = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.shuffle-item') as HTMLElement[];
      let currentIndex = 0;
      const interval = setInterval(() => {
        gsap.to(cards, {
          y: (i) => {
            const pos = (i - currentIndex + 3) % 3;
            return pos === 0 ? 0 : pos === 1 ? -16 : -32;
          },
          scale: (i) => {
            const pos = (i - currentIndex + 3) % 3;
            return pos === 0 ? 1 : pos === 1 ? 0.95 : 0.9;
          },
          opacity: (i) => {
            const pos = (i - currentIndex + 3) % 3;
            return pos === 0 ? 1 : pos === 1 ? 0.7 : 0.4;
          },
          zIndex: (i) => {
            const pos = (i - currentIndex + 3) % 3;
            return pos === 0 ? 30 : pos === 1 ? 20 : 10;
          },
          duration: 0.8,
          ease: "back.out(1.2)"
        });
        currentIndex = (currentIndex + 1) % 3;
      }, 3000);
      return () => clearInterval(interval);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {[1, 2, 3].map((item, i) => (
        <div 
          key={item} 
          className="shuffle-item absolute inset-x-8 top-16 bottom-16 bg-[var(--color-foreground)] border border-[var(--color-primary)]/10 shadow-lg rounded-lg flex flex-col justify-between p-4 text-[var(--color-primary)]"
          style={{
             transform: `translateY(${i === 0 ? 0 : i === 1 ? -16 : -32}px) scale(${i === 0 ? 1 : i === 1 ? 0.95 : 0.9})`,
             opacity: i === 0 ? 1 : i === 1 ? 0.7 : 0.4,
             zIndex: i === 0 ? 30 : i === 1 ? 20 : 10
          }}
        >
          <div className="text-xs font-mono font-bold">{item === 1 ? 'Prompt Data' : item === 2 ? 'Node Graph' : 'Model Hash'}</div>
          <div>
            <div className="h-2 w-1/3 bg-[var(--color-primary)]/20 rounded-full mb-2" />
            <div className="h-2 w-2/3 bg-[var(--color-primary)]/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

const TelemetryTypewriter = () => {
  const [text, setText] = useState("");
  const fullText = "> Initializing SQLite WAL...\n> Connected to local Vault\n> Audio Sync process active\n> DB Ingest complete: 0.12s";
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length + 20) {
        i = 0; // Reset after a pause
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs text-green-500 whitespace-pre-wrap flex-1 mt-4">
      {text}
      <span className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1" />
    </div>
  );
};

const CursorScheduler = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.set('.anim-cursor', { x: 0, y: 120, opacity: 0 })
        .to('.anim-cursor', { x: 40, y: 50, opacity: 1, duration: 1, ease: "power2.out" })
        .to('.anim-cursor', { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to('.cell-target', { backgroundColor: 'var(--color-accent)', color: 'var(--color-background)', duration: 0.2 }, "-=0.2")
        .to('.anim-cursor', { x: 120, y: 100, duration: 1, ease: "power2.inOut", delay: 0.5 })
        .to('.anim-cursor', { opacity: 0, duration: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-[10px] text-[var(--color-primary)] font-mono mb-4 text-center w-full max-w-[200px]">
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="opacity-50">{d}</div>)}
        {Array.from({length: 14}).map((_, i) => (
          <div key={i} className={`h-6 md:h-8 border border-[var(--color-primary)]/20 rounded-sm flex items-center justify-center transition-colors ${i === 10 ? 'cell-target' : ''}`}>
          </div>
        ))}
      </div>
      <svg className="anim-cursor absolute left-4 top-0 w-6 h-6 z-50 text-[var(--color-primary)] drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 5V2z" />
      </svg>
    </div>
  );
};

export default function Home() {
  const comp = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Navbar morph
      ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: "nav-scrolled", targets: ".navbar" },
      })

      // Hero stagger
      gsap.from(".hero-text-part", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2
      })
      
      gsap.from(".hero-cta", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.6
      })

      // Philosophy text reveal
      gsap.timeline({
        scrollTrigger: {
          trigger: ".philosophy-section",
          start: "top 60%",
        }
      })
      .from(".phil-neutral", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" })
      .from(".phil-drama", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }, "-=0.2")

      // Feature Cards stagger
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 70%"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      })

      // Protocol Stacking Archive
      const cards = gsap.utils.toArray('.protocol-card') as HTMLElement[]
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return // Last card doesn't squish

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: ".protocol-section",
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
        })

        gsap.to(card, {
          scale: 0.9,
          opacity: 0.2,
          filter: "blur(10px)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          }
        })
      })

    }, comp)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={comp} className="relative min-h-screen selection:bg-[var(--color-accent)] selection:text-[var(--color-primary)]">
      
      {/* NAVBAR */}
      <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[90%] max-w-4xl rounded-full transition-all duration-300 border border-transparent">
        <div className="font-mono font-bold tracking-tight text-xl mix-blend-difference text-white logo-text">Chimera_Studio</div>
        <div className="hidden md:flex gap-6 text-sm font-sans mix-blend-difference text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Architecture</a>
          <a href="#protocol" className="hover:text-white transition-colors">Protocol</a>
          <a href="https://studio.chimerawerks.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors font-bold tracking-wide">Live Demo</a>
        </div>
        <a href="mailto:hello@chimerawerks.com" className="px-5 py-2 text-sm font-bold bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full btn-magnetic inline-block">
          <span>Request Access</span>
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[100dvh] w-full flex flex-col justify-end p-8 md:p-16 overflow-hidden">
        {/* Background Image with Heavy Gradient */}
        <div 
          className="absolute inset-0 z-[-1] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        <div className="absolute inset-0 z-[-1] bg-gradient-to-t from-[var(--color-foreground)] via-[var(--color-foreground)]/80 to-[var(--color-foreground)]/10" />

        <div className="max-w-4xl pt-safe z-10 text-[var(--color-primary)] pb-12">
          <h1 className="flex flex-col gap-2 mb-8">
            <span className="hero-text-part font-sans font-bold text-3xl md:text-5xl tracking-tight text-[var(--color-primary)]/80 uppercase">
              Decompose the
            </span>
            <span className="hero-text-part font-serif italic text-6xl md:text-[8rem] leading-[0.85] text-[var(--color-primary)]">
              Metadata.
            </span>
          </h1>
          
          <div className="hero-cta flex flex-wrap gap-6 items-center">
            <a href="mailto:hello@chimerawerks.com" className="btn-magnetic px-8 py-4 bg-[var(--color-accent)] text-[var(--color-primary)] font-mono font-bold uppercase rounded-full flex items-center gap-3">
              <span>Request Access</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </a>
            <a href="https://studio.chimerawerks.com" target="_blank" rel="noopener noreferrer" className="btn-magnetic px-8 py-4 bg-transparent border border-[var(--color-primary)]/30 text-[var(--color-primary)] font-mono font-bold uppercase rounded-full flex items-center gap-3 hover:bg-[var(--color-primary)]/10 transition-colors">
              <span>Live Demo</span>
              <ArrowRight className="w-5 h-5 relative z-10 -rotate-45" />
            </a>
            <p className="font-mono text-sm opacity-60">React 19 / Vite / Zustand • Local SQLite WAL</p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY MANIFESTO */}
      <section className="philosophy-section relative w-full py-32 px-8 md:px-16 bg-[var(--color-foreground)] text-[var(--color-primary)] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen bg-[url('/images/texture.png')] bg-cover bg-center" />
        <div className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
          <p className="phil-neutral font-mono text-sm md:text-base uppercase tracking-widest opacity-50">
            Most platforms focus on: trapping your data in a cloud interface.
          </p>
          <p className="phil-drama font-serif italic text-4xl md:text-7xl leading-tight">
            We focus on: absolute <span className="text-[var(--color-accent)] not-italic font-sans">local sovereignty</span> and unspooling everything.
          </p>
        </div>
      </section>

      {/* FEATURES - INTERACTIVE ARTIFACTS */}
      <section id="features" className="relative w-full py-32 px-8 md:px-16 bg-[var(--color-foreground)] text-[var(--color-primary)] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-screen bg-[url('/images/features_bg.png')] bg-cover bg-center" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 font-mono text-sm tracking-widest uppercase border-b border-[var(--color-foreground)]/10 pb-4">
            System Modules
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="feature-card brutalist-card-dark p-8 flex flex-col justify-between gap-8 h-[450px]">
              <div className="h-full w-full bg-[var(--color-foreground)]/5 rounded-xl border border-[var(--color-foreground)]/10 relative overflow-hidden flex items-center justify-center">
                  <DiagnosticShuffler />
              </div>
              <div>
                <h3 className="font-sans font-bold text-2xl mb-2">Total Metadata Mastery</h3>
                <p className="font-mono text-sm opacity-70">Over 80+ ComfyUI node handlers. Extract and filter every workflow parameter, sampler, and prompt instantly from thousands of files.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-card brutalist-card-dark p-8 flex flex-col justify-between gap-8 h-[450px]">
              <div className="h-full w-full bg-[var(--color-foreground)]/5 rounded-xl border border-[var(--color-foreground)]/10 p-4 relative flex flex-col">
                  <div className="flex items-center gap-2 text-[var(--color-accent)] font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    LIVE TELEMETRY
                  </div>
                  <TelemetryTypewriter />
              </div>
              <div>
                <h3 className="font-sans font-bold text-2xl mb-2">Unified Media Engine</h3>
                <p className="font-mono text-sm opacity-70">A seamless interface bridging the Vault (ComfyUI Visuals) and Music (Suno Audio). Shared video node for zero-latency gapless playback.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-card brutalist-card-dark p-8 flex flex-col justify-between gap-8 h-[450px]">
              <div className="h-full w-full bg-[var(--color-foreground)]/5 rounded-xl border border-[var(--color-foreground)]/10 flex items-center justify-center relative overflow-hidden">
                  <CursorScheduler />
              </div>
              <div>
                <h3 className="font-sans font-bold text-2xl mb-2">Infinite Retrieval Scale</h3>
                <p className="font-mono text-sm opacity-70">A virtualized multi-format grid managing 10,000+ items at 60fps. Cascading filters operate dynamically in zero-time via isolated SQLite WAL databases.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE SCHEMATIC */}
      <section className="relative w-full py-32 px-8 md:px-16 bg-[var(--color-foreground)] text-[var(--color-primary)] border-t border-[var(--color-primary)]/10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen bg-[url('/images/arch_bg.png')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-20 font-mono text-sm tracking-widest uppercase border-b border-[var(--color-foreground)] pb-4 flex justify-between items-end">
            <span>System Architecture</span>
            <span className="opacity-50">LDD V1.0</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            {/* Frontend Column */}
            <div className="flex-1 flex flex-col gap-6">
              <h4 className="font-serif italic text-3xl mb-4">Frontend Layer</h4>
              <div className="border-l-2 border-[var(--color-accent)] pl-6 py-2 flex flex-col gap-3">
                <div className="font-mono font-bold">App.tsx Switcher</div>
                <div className="font-sans text-sm opacity-80">Root router dividing the UI state between Vault visuals and Music audio.</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[var(--color-foreground)]/5 p-4 rounded-lg border border-[var(--color-foreground)]/20">
                  <span className="font-mono text-xs opacity-50 block mb-2">PORT 20100</span>
                  <strong className="font-sans block">VaultLayout</strong>
                  <span className="font-mono text-xs opacity-70">Virtualized Grid, Zustand</span>
                </div>
                <div className="bg-[var(--color-foreground)]/5 p-4 rounded-lg border border-[var(--color-foreground)]/20">
                  <span className="font-mono text-xs opacity-50 block mb-2">PORT 20100</span>
                  <strong className="font-sans block">MusicLayout</strong>
                  <span className="font-mono text-xs opacity-70">Player, Job GeneratePanel</span>
                </div>
              </div>
            </div>

            {/* Connecting visual */}
            <div className="hidden lg:flex items-center justify-center opacity-20">
              <div className="w-16 h-px bg-[var(--color-foreground)]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--color-foreground)]"></div>
              <div className="font-mono text-xs mx-4">REST+WS</div>
              <div className="w-2 h-2 rounded-full bg-[var(--color-foreground)]"></div>
              <div className="w-16 h-px bg-[var(--color-foreground)]"></div>
            </div>

            {/* Backend Column */}
            <div className="flex-1 flex flex-col gap-6">
              <h4 className="font-serif italic text-3xl mb-4">Backend Data Layer</h4>
              
              <div className="border-l-2 border-[var(--color-foreground)] pl-6 py-2 flex flex-col gap-3">
                <div className="font-mono font-bold block bg-[var(--color-foreground)] text-[var(--color-primary)] w-fit px-3 py-1 text-xs uppercase mb-2">Single FastAPI Process</div>
                <div className="font-sans text-sm opacity-80">Isolated SQLite endpoints mapped via monolithic python daemon `run.py --tunnel`.</div>
              </div>
              
              <div className="flex flex-col gap-4 mt-4 relative">
                <div className="bg-[var(--color-foreground)]/5 p-4 rounded-lg border border-dashed border-[var(--color-foreground)]/40 flex justify-between items-center">
                  <div>
                    <strong className="font-mono text-sm block">chimeravault.db</strong>
                    <span className="font-sans text-xs opacity-70">SQLite WAL • Ingest & Search</span>
                  </div>
                  <Database className="w-5 h-5 opacity-50" />
                </div>
                <div className="bg-[var(--color-foreground)]/5 p-4 rounded-lg border border-dashed border-[var(--color-foreground)]/40 flex justify-between items-center">
                  <div>
                    <strong className="font-mono text-sm block">chimeramusic.db</strong>
                    <span className="font-sans text-xs opacity-70">SQLite WAL • Suno Job Manager</span>
                  </div>
                  <Database className="w-5 h-5 opacity-50" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* PROTOCOL - STACKING ARCHIVE */}
      <section id="protocol" className="protocol-section relative w-full bg-[var(--color-foreground)]">
        
        {/* Card 1 */}
        <div className="protocol-card h-[100dvh] w-full flex items-center justify-center sticky top-0 bg-[var(--color-foreground)] border-b border-[var(--color-primary)]/10 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen bg-[url('/images/protocol_1_bg.png')] bg-cover bg-center" />
          <div className="max-w-6xl w-full px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
             <div className="flex-1 text-[var(--color-primary)]">
               <span className="font-mono text-[var(--color-accent)] mb-4 block">01 / Ingestion</span>
               <h2 className="font-serif italic text-6xl md:text-8xl mb-6">Extract.</h2>
               <p className="font-sans text-xl opacity-70 max-w-md">Chimera Studio points at any output folder and retroactively digests thousands of images and videos. PNG chunks, MP4 atoms, and EXIF data are unspooled through independent Layer 1 and Layer 2 parser pipelines.</p>
             </div>
             <div className="flex-1 w-full h-[60vh] relative min-h-[300px] opacity-30 flex items-center justify-center">
                <Database className="w-64 h-64 text-[var(--color-primary)] drop-shadow-lg" strokeWidth={0.5} />
             </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="protocol-card h-[100dvh] w-full flex items-center justify-center sticky top-0 bg-[var(--color-foreground)] border-b border-[var(--color-primary)]/10 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen bg-[url('/images/protocol_2_bg.png')] bg-cover bg-center" />
          <div className="max-w-6xl w-full px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
             <div className="flex-1 text-[var(--color-primary)]">
               <span className="font-mono text-[var(--color-accent)] mb-4 block">02 / Organization</span>
               <h2 className="font-serif italic text-6xl md:text-8xl mb-6">Index.</h2>
               <p className="font-sans text-xl opacity-70 max-w-md">Data is not thrown into a JSON blob. It is rigidly structured into discrete, indexable fields residing in an ultra-fast local SQLite WAL database. 10,000+ files queried in zero-time via cascading filters.</p>
             </div>
             <div className="flex-1 w-full h-[60vh] relative min-h-[300px] opacity-30 flex items-center justify-center">
               <Activity className="w-64 h-64 text-[var(--color-primary)] drop-shadow-lg" strokeWidth={0.5} />
             </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="protocol-card h-[100dvh] w-full flex items-center justify-center sticky top-0 bg-[var(--color-foreground)] overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen bg-[url('/images/protocol_3_bg.png')] bg-cover bg-center" />
          <div className="max-w-6xl w-full px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
             <div className="flex-1 text-[var(--color-primary)]">
               <span className="font-mono text-[var(--color-accent)] mb-4 block">03 / Generation</span>
               <h2 className="font-serif italic text-6xl md:text-8xl mb-6">Create.</h2>
               <p className="font-sans text-xl opacity-70 max-w-md">Move beyond search. Queue up custom Suno AI music generation jobs, manage multi-account pools, and sync existing workspace libraries into your local grid, managed via an async job manager and WebSocket broadcasts.</p>
             </div>
             <div className="flex-1 w-full h-[60vh] relative min-h-[300px] opacity-30 flex items-center justify-center">
               <svg className="w-64 h-64 text-[var(--color-primary)] drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round">
                 <polygon points="12 2 2 7 12 12 22 7 12 2" />
                 <polyline points="2 17 12 22 22 17" />
                 <polyline points="2 12 12 17 22 12" />
               </svg>
             </div>
          </div>
        </div>

      </section>

      {/* BETA ACCESS CTA */}
      <section className="relative w-full py-32 px-8 md:px-16 bg-[var(--color-primary)] text-[var(--color-foreground)] text-center border-t border-[var(--color-foreground)]/10">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 relative z-10">
          <p className="font-mono text-[var(--color-accent)] text-sm tracking-widest uppercase">Beta Invite System</p>
          <h2 className="font-serif italic text-5xl md:text-7xl">Initiate Sequence.</h2>
          <p className="font-sans text-xl opacity-80 max-w-2xl">Chimera Studio is currently in closed alpha testing for select creators and engineers. Secure your early access key and start decomposing metadata locally.</p>
          <a href="mailto:hello@chimerawerks.com" className="btn-magnetic px-10 py-5 mt-4 bg-[var(--color-foreground)] text-[var(--color-primary)] font-mono font-bold text-lg md:text-xl rounded-full flex items-center gap-3">
            <span>hello@chimerawerks.com</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[var(--color-foreground)] text-[var(--color-primary)] px-8 md:px-16 pt-32 pb-16 relative z-10 rounded-t-[4rem]">
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
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Documentation</a>
                <a href="https://github.com/ChimeraWerks/ChimeraWerks" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">GitHub</a>
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Releases</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="opacity-40 uppercase mb-2">Legal</span>
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">License</a>
              </div>
            </div>
          </div>
          
          <div className="mt-32 border-t border-[var(--color-primary)]/10 pt-8 flex justify-between font-mono text-xs opacity-30 uppercase">
            <span>© 2026 Chimera Werks</span>
            <span>Local Database Authorized</span>
          </div>
        </div>
      </footer>
      
      {/* Global CSS overrides needed for dynamic JS classes */}
      <style dangerouslySetInnerHTML={{__html: `
        .nav-scrolled {
          background-color: rgba(245, 243, 238, 0.8) !important;
          backdrop-filter: blur(16px) !important;
          border-color: rgba(17, 17, 17, 0.1) !important;
          transform: translate(-50%, -10px) !important;
        }
        .nav-scrolled .logo-text {
          mix-blend-mode: normal !important;
          color: var(--color-foreground) !important;
        }
        .nav-scrolled a {
          mix-blend-mode: normal !important;
          color: var(--color-foreground) !important;
        }
        .nav-scrolled a:hover {
          color: var(--color-accent) !important;
        }
        /* Lock overflow-X to prevent ScrollTrigger horizontal scrolling bugs */
        body {
          overflow-x: hidden;
        }
      `}} />

    </main>
  )
}
