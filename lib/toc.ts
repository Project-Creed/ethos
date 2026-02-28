import type { Page } from 'puppeteer';

export interface TocEntry {
  title: string;
  page: number;
}

// PDF content area height per page:
// 9in total - 0.875in top margin - 1in bottom margin = 7.125in = 684px @ 96dpi
const CONTENT_H_PX = 684;
const COVER_PAGES = 1;
const TITLE_PAGES = 1;
// 82 chapters at ~10pt / 0.35rem spacing ≈ 4 pages
const TOC_PAGES = 4;

/**
 * Render the content HTML in browser-layout mode, measure each chapter's
 * offsetTop, and convert to approximate PDF page numbers.
 */
export async function measureChapterPages(
  page: Page,
  html: string
): Promise<TocEntry[]> {
  // Viewport width = PDF content area: 6in - 0.875in - 0.75in = 4.375in = 420px
  await page.setViewport({ width: 420, height: 864 });
  await page.setContent(html, { waitUntil: 'load' });

  const raw = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.chapter')).map((el) => ({
      title: el.querySelector('h1')?.textContent?.trim() ?? 'Untitled',
      top: (el as HTMLElement).offsetTop,
    }))
  );

  return raw.map(({ title, top }) => ({
    title,
    page: Math.floor(top / CONTENT_H_PX) + 1 + COVER_PAGES + TITLE_PAGES + TOC_PAGES,
  }));
}

export function buildTocHtml(entries: TocEntry[]): string {
  const rows = entries
    .map(
      ({ title, page }) => `
    <div class="toc-entry">
      <span class="toc-title">${title}</span>
      <span class="toc-leader"></span>
      <span class="toc-num">${page}</span>
    </div>`
    )
    .join('');

  return `<div class="toc-page">
  <h2 class="toc-heading">Contents</h2>
  ${rows}
</div>`;
}
