import type { Metadata } from "next";
import { Space_Grotesk, DM_Serif_Display, Space_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Chimera Studio | Total Metadata Mastery",
    template: "%s | Chimera Studio",
  },
  description: "Your local-first intelligence hub for ComfyUI outputs and AI music generation. Parse 80+ node types, search 10,000+ files at 60fps, generate AI audio — all locally.",
  metadataBase: new URL("https://chimerawerks.com"),
  openGraph: {
    title: "Chimera Studio | Total Metadata Mastery",
    description: "Your local-first intelligence hub for ComfyUI outputs and AI music generation.",
    url: "https://chimerawerks.com",
    siteName: "Chimera Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chimera Studio | Total Metadata Mastery",
    description: "Your local-first intelligence hub for ComfyUI outputs and AI music generation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased selection:bg-accent selection:text-white bg-[var(--color-foreground)]`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
