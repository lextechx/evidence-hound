#!/usr/bin/env node
/**
 * Validates every intervention file against the schema and checks the
 * cross-references between them. This is the gate every pull request passes.
 */

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { validate } from "./schema.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const interventionsDir = join(root, "data", "interventions");

export async function loadData() {
  const schema = JSON.parse(await readFile(join(root, "data", "schema", "intervention.schema.json"), "utf8"));
  const conditions = JSON.parse(await readFile(join(root, "data", "conditions.json"), "utf8"));
  const monitoring = JSON.parse(await readFile(join(root, "data", "monitoring.json"), "utf8"));
  const files = (await readdir(interventionsDir)).filter((f) => f.endsWith(".json")).sort();
  const interventions = [];
  for (const file of files) {
    const parsed = JSON.parse(await readFile(join(interventionsDir, file), "utf8"));
    interventions.push({ ...parsed, __file: file });
  }
  return { schema, conditions, monitoring, interventions };
}

const MONITORING_REQUIRED = ["id", "name", "priority", "direction", "why", "measure", "cadence", "red_flags"];

export function collectErrors({ schema, conditions, monitoring, interventions }) {
  const errors = [];
  const ids = new Set();

  for (const item of interventions) {
    const label = item.__file;
    const { __file, ...record } = item;

    for (const message of validate(record, schema)) {
      errors.push(`${label} ${message}`);
    }

    if (record.id && basename(label, ".json") !== record.id) {
      errors.push(`${label}: filename must match id "${record.id}"`);
    }
    if (ids.has(record.id)) {
      errors.push(`${label}: duplicate id "${record.id}"`);
    }
    ids.add(record.id);

    for (const condition of record.conditions ?? []) {
      if (!conditions[condition]) {
        errors.push(`${label}: references unknown condition "${condition}"`);
      }
    }
  }

  // Cross-references can only be checked once every id is known.
  for (const item of interventions) {
    for (const ref of item.see_also ?? []) {
      if (!ids.has(ref)) errors.push(`${item.__file}: see_also references unknown intervention "${ref}"`);
    }
  }

  const domainIds = new Set();
  for (const domain of monitoring?.domains ?? []) {
    const label = `monitoring.json[${domain.id ?? "?"}]`;

    for (const field of MONITORING_REQUIRED) {
      if (domain[field] === undefined) errors.push(`${label}: missing required field "${field}"`);
    }
    if (!["core", "supporting"].includes(domain.priority)) {
      errors.push(`${label}: priority must be "core" or "supporting"`);
    }
    if (!["higher_is_worse", "higher_is_better", "neutral"].includes(domain.direction)) {
      errors.push(`${label}: direction must be higher_is_worse, higher_is_better, or neutral`);
    }
    if (domainIds.has(domain.id)) errors.push(`${label}: duplicate domain id`);
    domainIds.add(domain.id);

    for (const ref of domain.links ?? []) {
      if (!ids.has(ref)) errors.push(`${label}: links to unknown intervention "${ref}"`);
    }
  }

  return errors;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const data = await loadData();
  const errors = collectErrors(data);
  if (errors.length) {
    console.error(`\n${errors.length} validation error(s):\n`);
    for (const message of errors) console.error(`  ✗ ${message}`);
    console.error("");
    process.exit(1);
  }
  console.log(
    `✓ ${data.interventions.length} interventions and ${Object.keys(data.conditions).length} conditions are valid.`,
  );
}
