#!/usr/bin/env node
// One-off asset generator: OG images (1200×630, per locale) and app icons.
// Text is converted to vector outlines with fontkit from the site's own
// variable fonts (Archivo wdth/wght, JetBrains Mono), so the output does not
// depend on system fonts. Outputs are committed under public/; re-run with
// `pnpm og` after changing the art.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';
import sharp from 'sharp';
import { decompress } from 'wawoff2';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');

async function loadFont(file, variation) {
  const woff2 = readFileSync(join(ROOT, 'node_modules', file));
  const font = fontkit.create(Buffer.from(await decompress(woff2)));
  return font.getVariation(variation);
}

const DISPLAY = await loadFont('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', {
  wdth: 125,
  wght: 900,
});
const LABEL = await loadFont('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', {
  wdth: 100,
  wght: 900,
});
const MONO = await loadFont('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', {
  wght: 700,
});

/** Lays out `text` and returns an SVG path (outlines) plus its width. */
function textPath(font, text, { x, y, size, anchor = 'start', tracking = 0, fill = '#0a0a0a' }) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  const width =
    run.positions.reduce((sum, pos) => sum + pos.xAdvance, 0) * scale + tracking * Math.max(0, text.length - 1);
  let cursor = anchor === 'middle' ? x - width / 2 : x;
  let d = '';
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    d += glyph.path
      .scale(scale, -scale)
      .translate(cursor + pos.xOffset * scale, y - pos.yOffset * scale)
      .toSVG();
    cursor += pos.xAdvance * scale + tracking;
  });
  return { svg: `<path d="${d}" fill="${fill}"/>`, width };
}

const INK = '#0a0a0a';
const PAPER = '#f3eee3';
const HONEY = '#ffc21a';
const WAX = '#ffe58a';

const hex = (cx, cy, r) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 180) * (60 * i - 90);
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');

const logoMark = (x, y, s, cell = HONEY, fg = INK) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <polygon points="30,2 58,18.2 58,51.1 30,67.3 2,51.1 2,18.2" fill="${cell}" stroke="${fg}" stroke-width="4"/>
    <polygon points="30,17 42,24 42,38 30,45 18,38 18,24" fill="${fg}"/>
    <polygon points="30,45 42,52 30,59 18,52" fill="${fg}"/>
  </g>`;

const pattern = `
  <pattern id="comb" width="56" height="100" patternUnits="userSpaceOnUse">
    <path d="M28 66L0 50V16L28 0l28 16v34L28 66zm0 0v34" fill="none" stroke="${INK}" stroke-opacity=".12" stroke-width="2"/>
  </pattern>`;

const COPY = {
  es: {
    lines: ['AGENTES DE IA', 'PARA REDES', 'SOCIALES.'],
    sub: 'Organizados como una colmena · Lista de espera abierta',
    hives: ['INSTAGRAM', 'TIKTOK', 'YT SHORTS', 'X'],
  },
  en: {
    lines: ['AI AGENTS', 'FOR SOCIAL', 'MEDIA.'],
    sub: 'Organized like a hive · Waitlist now open',
    hives: ['INSTAGRAM', 'TIKTOK', 'YT SHORTS', 'X'],
  },
};

function ogSvg(locale) {
  const { lines, sub, hives } = COPY[locale];
  const R = 74;
  const W = Math.sqrt(3) * R;
  const cells = [
    { x: 0, y: 0, fill: '#fff', label: hives[0] },
    { x: 1, y: 0, fill: WAX },
    { x: -0.5, y: 1, fill: '#fff', label: hives[1] },
    { x: 0.5, y: 1, fill: INK, core: true },
    { x: 1.5, y: 1, fill: '#fff', label: hives[2] },
    { x: 0, y: 2, fill: HONEY },
    { x: 1, y: 2, fill: '#fff', label: hives[3] },
  ];
  // Uniform headline size that keeps the widest line inside a 680px column.
  const widest = Math.max(...lines.map((line) => textPath(DISPLAY, line, { x: 0, y: 0, size: 76 }).width));
  const headlineSize = Math.min(80, (76 * 680) / widest);
  const subY = 218 + 2 * 92 + 78;
  const subText = textPath(MONO, sub, { x: 76, y: subY, size: 19 });
  const ox = 900;
  const oy = 170;
  const comb = cells
    .map((c) => {
      const cx = ox + c.x * W;
      const cy = oy + c.y * R * 1.5;
      return `
        <polygon points="${hex(cx + 9, cy + 9, R)}" fill="${INK}"/>
        <polygon points="${hex(cx, cy, R)}" fill="${c.fill}" stroke="${INK}" stroke-width="5"/>
        ${c.label ? textPath(LABEL, c.label, { x: cx, y: cy + 6, size: 17, anchor: 'middle' }).svg : ''}
        ${c.core ? logoMark(cx - 30, cy - 34, 1, HONEY, INK) : ''}`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>${pattern}</defs>
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="630" fill="url(#comb)"/>
  <rect x="14" y="14" width="1172" height="602" fill="none" stroke="${INK}" stroke-width="8"/>
  ${logoMark(58, 52, 0.9)}
  ${textPath(DISPLAY, 'BIN HIVE', { x: 124, y: 84, size: 28 }).svg}
  ${lines.map((line, i) => textPath(DISPLAY, line, { x: 58, y: 218 + i * 92, size: headlineSize, tracking: -1 }).svg).join('')}
  <rect x="58" y="${subY - 34}" width="${subText.width + 36}" height="52" fill="${HONEY}" stroke="${INK}" stroke-width="4"/>
  ${subText.svg}
  ${textPath(MONO, 'binhive.arrobabeto.com', { x: 58, y: 584, size: 20 }).svg}
  ${comb}
</svg>`;
}

function iconSvg(size, padding = 0.12) {
  const inner = size * (1 - padding * 2);
  const scale = inner / 69.28;
  const x = (size - 60 * scale) / 2;
  const y = (size - 69.28 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  ${logoMark(x, y, scale, HONEY, INK).replace(`stroke="${INK}" stroke-width="4"`, `stroke="${HONEY}" stroke-width="0"`)}
</svg>`;
}

const png = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

for (const locale of Object.keys(COPY)) {
  const file = join(PUBLIC, 'og', `og-${locale}.png`);
  writeFileSync(file, await png(ogSvg(locale)));
  console.log(`[og] ${file}`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 69.28"><polygon points="30,2 58,18.2 58,51.1 30,67.3 2,51.1 2,18.2" fill="${HONEY}" stroke="${INK}" stroke-width="4"/><polygon points="30,17 42,24 42,38 30,45 18,38 18,24" fill="${INK}"/><polygon points="30,45 42,52 30,59 18,52" fill="${INK}"/></svg>\n`;
writeFileSync(join(PUBLIC, 'favicon.svg'), favicon);

for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  writeFileSync(join(PUBLIC, name), await png(iconSvg(size)));
}

// favicon.ico: a single 32×32 PNG wrapped in an ICO container.
const ico32 = await sharp(Buffer.from(favicon)).resize(32, 32, { fit: 'contain', background: '#0000' }).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync(join(PUBLIC, 'favicon.ico'), Buffer.concat([header, ico32]));
console.log('[og] icons: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png');
