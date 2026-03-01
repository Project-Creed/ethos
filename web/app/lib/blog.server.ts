import fs from "node:fs";
import path from "node:path";
import { marked, Renderer } from "marked";

// In Lambda (production), chapters are bundled alongside the server build at process.cwd()/chapters/.
// In local dev (running from web/), chapters live one level up at ../chapters/.
const CHAPTERS_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "chapters")
    : path.join(process.cwd(), "..", "chapters");

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ChapterMeta {
  slug: string;
  order: number;
  title: string;
  description: string;
}

export interface Chapter extends ChapterMeta {
  html: string;
  toc: TocEntry[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
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

function parseContent(content: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];

  const renderer = new Renderer();
  renderer.heading = function (token: { text: string; depth: number; raw: string }) {
    const id = slugify(token.raw.replace(/^#+\s*/, ""));
    if (token.depth === 2 || token.depth === 3) {
      toc.push({ id, text: token.text, level: token.depth as 2 | 3 });
    }
    return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>\n`;
  };

  const html = marked(content, { renderer }) as string;
  return { html, toc };
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
  const { html, toc } = parseContent(content);
  return {
    slug,
    order: filenameToOrder(filename),
    title: extractTitle(content),
    description: extractDescription(content),
    html,
    toc,
  };
}
