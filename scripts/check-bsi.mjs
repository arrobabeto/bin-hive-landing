#!/usr/bin/env node
// Post-build BSI gate: the inventory must match the content, and every
// rendered data-bf-* marker must match the inventory (and vice versa) on both
// home pages. Run after `pnpm build`. Exit 0 required in CI.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  INVENTORY_PATH,
  ROOT,
  compareInventory,
  deriveSurfaces,
  extractMarkers,
  loadInventory,
  requiresMarker,
} from './bsi-lib.mjs';

const DIST = join(ROOT, 'dist');
const HOME_PAGES = { es: 'index.html', en: 'en/index.html' };
const problems = [];

const { rows, errors } = deriveSurfaces();
problems.push(...errors);
const inventory = loadInventory();
problems.push(...compareInventory(inventory, rows));

const rowsById = new Map((inventory?.surfaces ?? []).map((row) => [row.bf_id, row]));

if (!existsSync(DIST)) {
  problems.push('dist/ not found — run `pnpm build` first');
} else {
  const htmlFiles = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.html')) htmlFiles.push(full);
    }
  };
  walk(DIST);

  // 1) Every marker on every page is declared, with matching kind/section.
  for (const file of htmlFiles) {
    const page = relative(DIST, file);
    const markers = extractMarkers(readFileSync(file, 'utf8'));
    const seen = new Set();
    for (const marker of markers) {
      const row = rowsById.get(marker.bf_id);
      if (!row) {
        problems.push(`${page}: marker ${marker.bf_id} is not in ${INVENTORY_PATH}`);
        continue;
      }
      if (marker.kind !== row.kind) {
        problems.push(`${page}: ${marker.bf_id} data-bf-kind="${marker.kind}", inventory says "${row.kind}"`);
      }
      if (marker.section !== row.section) {
        problems.push(`${page}: ${marker.bf_id} data-bf-section="${marker.section}", inventory says "${row.section}"`);
      }
      if ((marker.presentation ?? undefined) !== (row.presentation ?? undefined) && row.kind === 'image') {
        problems.push(`${page}: ${marker.bf_id} presentation mismatch`);
      }
      if (seen.has(marker.bf_id)) problems.push(`${page}: ${marker.bf_id} is marked more than once`);
      seen.add(marker.bf_id);
    }
  }

  // 2) Every markable inventory row is rendered on both home pages.
  for (const [locale, page] of Object.entries(HOME_PAGES)) {
    const file = join(DIST, page);
    if (!existsSync(file)) {
      problems.push(`${page} missing from dist/`);
      continue;
    }
    const ids = new Set(extractMarkers(readFileSync(file, 'utf8')).map((m) => m.bf_id));
    for (const row of rowsById.values()) {
      if (!row.locales.includes(locale) || !requiresMarker(row)) continue;
      if (!ids.has(row.bf_id)) problems.push(`${page}: no marker for ${row.bf_id}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`[check:bsi] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check:bsi] OK — ${rowsById.size} surfaces, markers match on es + en.`);
