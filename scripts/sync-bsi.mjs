#!/usr/bin/env node
// Refreshes binflow/surface-inventory.yaml from src/content/home/*.yaml.
// Freshness gate adapted from Binflow's surface-inventory-sync.md:
//  - preserves stable bf_ids and hand-tuned notes / deny_reason
//  - adds rows for new surfaces and refreshes samples
//  - never deletes orphans silently (they are reported; remove them by hand
//    with a migration note in docs/BSI.md)
import { existsSync, writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import {
  INVENTORY_PATH,
  PROJECT_KEY,
  ROOT,
  deriveSurfaces,
  loadInventory,
} from './bsi-lib.mjs';

const { rows, errors } = deriveSurfaces();
if (errors.length > 0) {
  console.error('[bsi:sync] content is inconsistent:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

const existing = existsSync(new URL(`../${INVENTORY_PATH}`, import.meta.url))
  ? (loadInventory()?.surfaces ?? [])
  : [];
const byId = new Map(existing.map((row) => [row.bf_id, row]));
const derivedIds = new Set(rows.map((row) => row.bf_id));

let added = 0;
let refreshed = 0;
const merged = rows.map((row) => {
  const current = byId.get(row.bf_id);
  if (!current) {
    added += 1;
    return row;
  }
  if (current.sample !== row.sample) refreshed += 1;
  // Derived fields win; hand-tuned prose fields are preserved.
  return {
    ...row,
    ...(current.deny_reason ? { deny_reason: current.deny_reason } : {}),
    ...(current.notes ? { notes: current.notes } : {}),
  };
});

const orphans = existing.filter((row) => !derivedIds.has(row.bf_id));
merged.push(...orphans);

const header =
  '# Binflow Surface Inventory (BSI) — bin-hive-landing (astro-repo profile)\n' +
  '# Generated/merged by `pnpm bsi:sync`; verified by `pnpm test` and `pnpm check:bsi`.\n' +
  '# bf_ids are API contracts: never rename them. Rules: docs/BSI.md\n';

writeFileSync(
  new URL(`../${INVENTORY_PATH}`, import.meta.url),
  header +
    stringify({ version: 1, project_key: PROJECT_KEY, surfaces: merged }, { lineWidth: 0 })
      // Keep locale lists compact, as in the Binflow BSI examples.
      .replace(/locales:\n((?:\s+- [a-z]{2}\n)+)/gu, (_, items) => `locales: [${items.match(/[a-z]{2}/gu).join(', ')}]\n`),
);

console.log(
  `[bsi:sync] ${INVENTORY_PATH}: ${merged.length} rows (${added} added, ${refreshed} samples refreshed)`,
);
if (orphans.length > 0) {
  console.warn(
    `[bsi:sync] ${orphans.length} orphan row(s) kept — remove deliberately with a migration note:\n  - ` +
      orphans.map((row) => row.bf_id).join('\n  - '),
  );
}
void ROOT;
