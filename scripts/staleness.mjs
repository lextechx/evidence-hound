#!/usr/bin/env node
/**
 * Evidence goes stale. Flags entries not reviewed in over a year so they
 * surface in CI instead of quietly aging on the site.
 */

import { loadData } from "./validate.mjs";

const STALE_AFTER_DAYS = 365;
const now = Date.now();

const { interventions } = await loadData();

const stale = interventions
  .map((item) => ({
    id: item.id,
    days: Math.floor((now - Date.parse(item.last_reviewed)) / 86_400_000),
  }))
  .filter((item) => item.days > STALE_AFTER_DAYS)
  .sort((a, b) => b.days - a.days);

if (!stale.length) {
  console.log(`✓ All ${interventions.length} entries reviewed within the last ${STALE_AFTER_DAYS} days.`);
  process.exit(0);
}

console.warn(`\n${stale.length} entr${stale.length === 1 ? "y needs" : "ies need"} re-review:\n`);
for (const item of stale) {
  console.warn(`  ⚠ ${item.id}: last reviewed ${item.days} days ago`);
}
console.warn("\nRe-check the sources, then update last_reviewed.\n");
process.exit(1);
