import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

export interface Chapter {
  filename: string;
  order: number;
  html: string;
}

export function loadChapters(srcDir: string): Chapter[] {
  const files = fs.readdirSync(srcDir)
    .filter((f) => f.endsWith('.md') && /^\d+/.test(f))
    .sort();

  return files.map((filename) => {
    const order = parseInt(filename.split('-')[0], 10);
    const raw = fs.readFileSync(path.join(srcDir, filename), 'utf-8');
    const html = marked.parse(raw) as string;
    return { filename, order, html };
  });
}
