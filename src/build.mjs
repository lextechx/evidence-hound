#!/usr/bin/env node
/**
 * Static site generator for Evidence Hound.
 *
 * Reads the JSON evidence files, writes dist/. No dependencies, no build
 * pipeline, no lock file to audit. `node src/build.mjs` is the whole thing.
 */

import { mkdir, writeFile, readFile, rm, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, collectErrors } from "../scripts/validate.mjs";
import {
  layout,
  homePage,
  interventionPage,
  conditionPage,
  methodsPage,
  monitoringPage,
  storyPage,
  dataPage,
  aboutPage,
  notFoundPage,
} from "./render.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const BASE = process.env.BASE_PATH ?? "";

const TIER_ORDER = { A: 0, B: 1, C: 2, U: 3, D: 4 };

async function writePage(path, html) {
  const target = join(dist, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

async function build() {
  const data = await loadData();

  const errors = collectErrors(data);
  if (errors.length) {
    console.error("Refusing to build with invalid data. Run `npm run validate` for detail.");
    for (const message of errors) console.error(`  ✗ ${message}`);
    process.exit(1);
  }

  const interventions = data.interventions
    .map(({ __file, ...record }) => record)
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name));

  const ctx = { base: BASE, interventions, conditions: data.conditions };

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await writePage("index.html", layout(ctx, { title: null, page: homePage(ctx) }));

  for (const intervention of interventions) {
    await writePage(
      `interventions/${intervention.id}/index.html`,
      layout(ctx, {
        title: intervention.name,
        description: intervention.plain_summary,
        page: interventionPage(ctx, intervention),
      }),
    );
  }

  for (const [id, condition] of Object.entries(data.conditions)) {
    const related = interventions.filter((i) => i.conditions.includes(id));
    await writePage(
      `conditions/${id}/index.html`,
      layout(ctx, {
        title: condition.name,
        description: condition.short,
        page: conditionPage(ctx, id, condition, related),
      }),
    );
  }

  await writePage("methods/index.html", layout(ctx, { title: "How we grade evidence", page: methodsPage(ctx) }));
  await writePage(
    "monitoring/index.html",
    layout(ctx, {
      title: data.monitoring.framework.name,
      description: data.monitoring.framework.premise,
      page: monitoringPage(ctx, data.monitoring),
    }),
  );
  const story = await readFile(join(root, "content", "story.md"), "utf8");
  await writePage(
    "story/index.html",
    layout(ctx, {
      title: "Why this exists",
      description: "The dog this project is named for, and the signals I did not know how to read.",
      page: storyPage(ctx, story),
    }),
  );

  const dataPolicy = await readFile(join(root, "content", "data.md"), "utf8");
  await writePage(
    "data/index.html",
    layout(ctx, {
      title: "How we handle data",
      description: "The evidence is open. Your dog's record is private. Why both, and what we commit to.",
      page: dataPage(ctx, dataPolicy),
    }),
  );

  await writePage("about/index.html", layout(ctx, { title: "About", page: aboutPage(ctx) }));
  await writePage("404.html", layout(ctx, { title: "Not found", page: notFoundPage(ctx) }));

  // The dataset itself is the product. Publish it as a plain file anyone can consume.
  await writeFile(
    join(dist, "data.json"),
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        conditions: data.conditions,
        monitoring: data.monitoring,
        interventions,
      },
      null,
      2,
    ),
    "utf8",
  );

  await copyFile(join(root, "src", "site.css"), join(dist, "site.css"));
  await writeFile(join(dist, ".nojekyll"), "", "utf8");

  console.log(
    `✓ Built ${interventions.length} interventions and ${Object.keys(data.conditions).length} conditions into dist/`,
  );
}

await build();
