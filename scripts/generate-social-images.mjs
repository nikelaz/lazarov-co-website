import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'public', 'images', 'social');
await mkdir(output, { recursive: true });

const esc = (value) => value.replaceAll('&', '&amp;');
const frame = ({ title, subtitleLines, mark, textX = 286, accent = '#1f4e79' }) => {
  const lineHeight = 50;
  const relativeTop = mark ? 0 : 38;
  const relativeBottom = 223 + (subtitleLines.length - 1) * lineHeight;
  const top = Math.round(315 - (relativeTop + relativeBottom) / 2);
  const titleY = top + 90;
  const subtitleY = top + 215;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8f7f4"/>
  <rect x="0" y="0" width="14" height="630" fill="${accent}"/>
  ${mark ? mark(top) : ''}
  <text x="${textX}" y="${titleY}" fill="#191817" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700">${esc(title)}</text>
  <text x="92" y="${subtitleY}" fill="#66625c" font-family="Arial, sans-serif" font-size="34">
    ${subtitleLines.map((line, index) => `<tspan x="92" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}
  </text>
</svg>`;
};

const budgetIcon = await readFile(join(root, 'public', 'images', 'budget-warden-icon.svg'));
const budgetMark = (top) => `<image x="92" y="${top}" width="150" height="150" href="data:image/svg+xml;base64,${budgetIcon.toString('base64')}"/>`;

const voiceMark = (top) => `
  <rect x="92" y="${top}" width="150" height="150" rx="34" fill="#171719"/>
  <g transform="translate(128 ${top + 36}) scale(3.25)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round">
    <path d="M4 12h2m2-4v8m3-11v14m3-11v8m3-6v4m3-3v2"/>
  </g>`;

const images = [
  ['lazarovco.png', frame({
    title: 'Lazarov & Co',
    subtitleLines: ['Fast, reliable software built with care.'],
    textX: 92,
  })],
  ['budget-warden.png', frame({
    title: 'Budget Warden',
    subtitleLines: [
      'Are you tired of fragile spreadsheets and complicated apps?',
      'Budget Warden makes personal budgeting simple.',
    ],
    mark: budgetMark,
    accent: '#03318B',
  })],
  ['voice-ready.png', frame({
    title: 'Voice Ready',
    subtitleLines: [
      'Drop in audio or video. Reduce background noise,',
      'even out speech, shape the tone, and deliver the right',
      'loudness, all in one focused app.',
    ],
    mark: voiceMark,
  })],
];

for (const [name, svg] of images) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(output, name));
}

await sharp(join(root, 'public', 'favicon.svg')).resize(64, 64).png().toFile(join(root, 'public', 'favicon.png'));
