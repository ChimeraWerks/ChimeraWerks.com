import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Toolkit",
  description: "Claude Code extensions, plugins, and MCP server setup for the ChimeraWerks development environment.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ToolkitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
