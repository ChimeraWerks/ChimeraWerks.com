"use client"

import { useMemo } from "react"

function markdownToHtml(md: string): string {
  let html = md.trim()

  // Headings (### only for devlog)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--color-accent)] hover:opacity-70 transition-opacity underline underline-offset-4">$1</a>')

  // Process line-by-line for paragraphs and lists
  const lines = html.split("\n")
  const blocks: string[] = []
  let inList = false
  let listItems: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        inList = true
        listItems = []
      }
      listItems.push(`<li>${trimmed.slice(2)}</li>`)
    } else {
      if (inList) {
        blocks.push(`<ul>${listItems.join("")}</ul>`)
        inList = false
        listItems = []
      }
      if (trimmed === "") {
        continue
      } else if (trimmed.startsWith("<h3>")) {
        blocks.push(trimmed)
      } else {
        blocks.push(`<p>${trimmed}</p>`)
      }
    }
  }
  if (inList) {
    blocks.push(`<ul>${listItems.join("")}</ul>`)
  }

  return blocks.join("\n")
}

export function DevlogContent({ content }: { content: string }) {
  const html = useMemo(() => markdownToHtml(content), [content])

  return (
    <div
      className="devlog-prose font-sans text-base leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
