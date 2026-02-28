import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { measureChapterPages, buildTocHtml } from './toc';
import { buildHtml } from './template';
import type { Chapter } from './chapters';

const PAGE_W = '6in';
const PAGE_H = '9in';

const MARGINS = {
  top: '0.875in',
  right: '0.75in',
  bottom: '1in',
  left: '0.875in',
};

const FOOTER = `
  <div style="
    width: 100%;
    text-align: center;
    font-family: Georgia, serif;
    font-size: 9pt;
    color: #666;
    padding-bottom: 0.3in;
  ">
    <span class="pageNumber"></span>
  </div>
`;

async function renderHtmlToPdfBytes(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>['newPage']>>,
  html: string,
  options: Parameters<typeof page.pdf>[0]
): Promise<Buffer> {
  await page.setContent(html, { waitUntil: 'load' });
  return page.pdf(options) as Promise<Buffer>;
}

export async function generatePdf(
  chapters: Chapter[],
  coverImagePath: string | undefined,
  outputPath: string
): Promise<void> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const tab = await browser.newPage();

    // ── Pass 1: measure chapter positions to build TOC ──
    const baseHtml = buildHtml(chapters);
    const tocEntries = await measureChapterPages(tab, baseHtml);
    const tocHtml = buildTocHtml(tocEntries);

    // ── Pass 2: final content HTML with TOC injected ──
    const contentHtml = buildHtml(chapters, tocHtml);

    // ── Content PDF (title page + TOC + chapters, normal margins) ──
    const contentBytes = await renderHtmlToPdfBytes(tab, contentHtml, {
      width: PAGE_W,
      height: PAGE_H,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: FOOTER,
      margin: MARGINS,
    });

    // ── If no cover image, write content PDF directly ──
    if (!coverImagePath || !fs.existsSync(coverImagePath)) {
      fs.writeFileSync(outputPath, contentBytes);
      return;
    }

    // ── Cover PDF (zero margins, no footer) ──
    const base64 = fs.readFileSync(coverImagePath).toString('base64');
    const coverHtml = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  html, body { width: 6in; height: 9in; overflow: hidden; }
  img { display: block; width: 6in; height: 9in; object-fit: fill; }
</style></head>
<body><img src="data:image/jpeg;base64,${base64}"/></body>
</html>`;

    const coverBytes = await renderHtmlToPdfBytes(tab, coverHtml, {
      width: PAGE_W,
      height: PAGE_H,
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    // ── Merge: cover (page 1) + content (remaining pages) ──
    const merged = await PDFDocument.create();

    const coverDoc = await PDFDocument.load(coverBytes);
    const [coverPage] = await merged.copyPages(coverDoc, [0]);
    merged.addPage(coverPage);

    const contentDoc = await PDFDocument.load(contentBytes);
    const contentPages = await merged.copyPages(
      contentDoc,
      Array.from({ length: contentDoc.getPageCount() }, (_, i) => i)
    );
    contentPages.forEach((p) => merged.addPage(p));

    fs.writeFileSync(outputPath, await merged.save());
  } finally {
    await browser.close();
  }
}
