import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// web/app/lib -> web/app -> web -> project root -> chapters
const CHAPTERS_DIR = path.join(__dirname, "..", "..", "..", "chapters");

export interface ChapterMeta {
  slug: string;
  order: number;
  title: string;
  description: string;
}

export interface Chapter extends ChapterMeta {
  html: string;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function extractDescription(content: string): string {
  // Remove frontmatter and leading heading, grab first real paragraph
  const withoutHeading = content.replace(/^#\s+.+$/m, "").trim();
  const lines = withoutHeading.split("\n");
  const paragraphLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (paragraphLines.length > 0) break;
      continue;
    }
    paragraphLines.push(trimmed);
  }
  const raw = paragraphLines.join(" ").replace(/\*\*/g, "").replace(/\*/g, "");
  return raw.length > 200 ? raw.slice(0, 197) + "…" : raw;
}

function filenameToSlug(filename: string): string {
  // "01-foundation.md" -> "foundation"
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "");
}

function filenameToOrder(filename: string): number {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}

export function getChapterSlugs(): string[] {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  return fs
    .readdirSync(CHAPTERS_DIR)
    .filter((f) => f.endsWith(".md") && /^\d+/.test(f))
    .sort()
    .map(filenameToSlug);
}

export function getAllChapters(): ChapterMeta[] {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  return fs
    .readdirSync(CHAPTERS_DIR)
    .filter((f) => f.endsWith(".md") && /^\d+/.test(f))
    .sort()
    .map((filename) => {
      const content = fs.readFileSync(path.join(CHAPTERS_DIR, filename), "utf-8");
      return {
        slug: filenameToSlug(filename),
        order: filenameToOrder(filename),
        title: extractTitle(content),
        description: extractDescription(content),
      };
    });
}

export function getChapter(slug: string): Chapter | null {
  if (!fs.existsSync(CHAPTERS_DIR)) return null;
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith(".md") && /^\d+/.test(f));
  const filename = files.find((f) => filenameToSlug(f) === slug);
  if (!filename) return null;
  const content = fs.readFileSync(path.join(CHAPTERS_DIR, filename), "utf-8");
  const html = marked(content) as string;
  return {
    slug,
    order: filenameToOrder(filename),
    title: extractTitle(content),
    description: extractDescription(content),
    html,
  };
}
