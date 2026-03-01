#!/usr/bin/env node
/**
 * Adds H2 section headings to all Ethosism chapter markdown files.
 * Uses Claude Haiku to place 3-5 headings per chapter at natural paragraph breaks.
 * Safe to re-run — skips any chapter that already has ## headings.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHAPTERS_DIR = path.join(__dirname, "..", "chapters");
const client = new Anthropic();

// The Introduction uses bold+HR formatting for sections — convert that directly
// rather than calling the API.
function convertIntroductionFormat(content) {
  return content
    .replace(/^---\s*$/gm, "")                             // remove HR dividers
    .replace(/^\*\*(.+?)\.\*\*\s*$/gm, "## $1")           // **Who this is for.** → ## Who This Is For
    .replace(/\n{3,}/g, "\n\n")                             // collapse extra blank lines
    .trimEnd() + "\n";
}

async function addHeadingsToChapter(filename) {
  const filepath = path.join(CHAPTERS_DIR, filename);
  const content = fs.readFileSync(filepath, "utf-8");

  // Skip if already has H2 headings
  if (/^## /m.test(content)) {
    console.log(`  skip (already has headings): ${filename}`);
    return;
  }

  // Introduction: convert its existing bold/HR structure
  if (filename.startsWith("00-")) {
    const updated = convertIntroductionFormat(content);
    fs.writeFileSync(filepath, updated);
    console.log(`  ✓ converted (introduction): ${filename}`);
    return;
  }

  // Split into title + body paragraphs
  const [titleLine, ...rest] = content.split("\n");
  const body = rest.join("\n").trim();
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0);

  if (paragraphs.length < 4) {
    console.log(`  skip (too short): ${filename}`);
    return;
  }

  // Build a compact preview for the API call (first 120 chars of each paragraph)
  const preview = paragraphs
    .map((p, i) => `[${i}] ${p.replace(/\n/g, " ").slice(0, 120)}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Add 3–5 section headings to this essay-style chapter.
The chapter has ${paragraphs.length} paragraphs, numbered 0–${paragraphs.length - 1}.

Rules:
- Never insert a heading before paragraph 0 (the opening stands alone)
- Headings mark genuine topic shifts, not every paragraph
- Heading text: short (3–6 words), direct, no fluff
- Common sections in these chapters: what it is, how it works, failure modes, daily practice

Paragraph previews:
${preview}

Return ONLY a JSON array, no other text. Example format:
[{"before":2,"text":"What It Actually Means"},{"before":6,"text":"The Failure Modes"},{"before":9,"text":"Daily Practice"}]`,
      },
    ],
  });

  const raw = response.content[0].text.trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    console.error(`  ✗ no JSON found for ${filename}: ${raw}`);
    return;
  }

  let headings;
  try {
    headings = JSON.parse(match[0]);
  } catch {
    console.error(`  ✗ JSON parse error for ${filename}`);
    return;
  }

  // Validate and filter headings
  headings = headings.filter(
    (h) =>
      typeof h.before === "number" &&
      h.before >= 1 &&
      h.before < paragraphs.length &&
      typeof h.text === "string" &&
      h.text.trim().length > 0
  );

  if (headings.length === 0) {
    console.error(`  ✗ no valid headings for ${filename}`);
    return;
  }

  // Rebuild markdown
  const lines = [titleLine, ""];
  for (let i = 0; i < paragraphs.length; i++) {
    const h = headings.find((h) => h.before === i);
    if (h) {
      lines.push(`## ${h.text}`);
      lines.push("");
    }
    lines.push(paragraphs[i]);
    lines.push("");
  }

  fs.writeFileSync(filepath, lines.join("\n").trimEnd() + "\n");
  console.log(`  ✓ ${filename} (${headings.length} headings: ${headings.map((h) => `"${h.text}"`).join(", ")})`);
}

// Main — process in batches of 6 with a small delay between batches
const files = fs
  .readdirSync(CHAPTERS_DIR)
  .filter((f) => f.endsWith(".md") && /^\d+/.test(f))
  .sort();

console.log(`Processing ${files.length} chapters...\n`);

const BATCH = 6;
for (let i = 0; i < files.length; i += BATCH) {
  const batch = files.slice(i, i + BATCH);
  await Promise.all(batch.map(addHeadingsToChapter));
  if (i + BATCH < files.length) {
    await new Promise((r) => setTimeout(r, 800));
  }
}

console.log("\nDone.");
