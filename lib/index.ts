import * as path from 'path';
import { loadChapters } from './chapters';
import { generatePdf } from './pdf';
import { generateEpub } from './kindle';

const args = process.argv.slice(2);
const wantPdf    = args.includes('--pdf')    || args.includes('--all') || args.length === 0;
const wantKindle = args.includes('--kindle') || args.includes('--all') || args.length === 0;

const srcDir    = path.join(__dirname, '..', 'chapters');
const outputDir = path.join(__dirname, '..', 'output');
const coverPath = path.join(__dirname, '..', 'media', 'ethosian-knight.jpeg');
const epubPath  = path.join(outputDir, 'ethos.epub');
const pdfPath   = path.join(outputDir, 'ethos.pdf');

async function main(): Promise<void> {
  console.log('Loading chapters from src/...');
  const chapters = loadChapters(srcDir);
  console.log(`  ${chapters.length} chapters found.\n`);

  if (wantKindle) {
    console.log('Generating EPUB (Kindle)...');
    await generateEpub(chapters, coverPath, epubPath);
    console.log(`  EPUB written to:  ${epubPath}\n`);
  }

  if (wantPdf) {
    console.log('Generating PDF (with TOC)...');
    await generatePdf(chapters, coverPath, pdfPath);
    console.log(`  PDF written to:   ${pdfPath}\n`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
