import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "devlog");

export interface DevlogEntry {
  day: number;
  date: string;
  title: string;
  commitCount: number;
  commits: string[];
  content: string;
  preview: string;
}

function getPreview(content: string): string {
  const lines = content.trim().split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("**"));
  return lines[0]?.slice(0, 200) || "";
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

export function getAllDays(): DevlogEntry[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        day: data.day as number,
        date: data.date as string,
        title: data.title as string,
        commitCount: data.commitCount as number,
        commits: (data.commits || []) as string[],
        content,
        preview: getPreview(content),
      };
    })
    .sort((a, b) => a.day - b.day);
}

export function getDay(day: number): (DevlogEntry & { readingTime: number }) | null {
  const filePath = path.join(CONTENT_DIR, `day-${day}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    day: data.day as number,
    date: data.date as string,
    title: data.title as string,
    commitCount: data.commitCount as number,
    commits: (data.commits || []) as string[],
    content,
    preview: getPreview(content),
    readingTime: readingTime(content),
  };
}

export function getStaticDayParams() {
  return getAllDays().map((entry) => ({ day: `day-${entry.day}` }));
}
