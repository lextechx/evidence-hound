#!/usr/bin/env node
/*
 * Evidence Hound: what actually works for aging dogs.
 * Copyright (C) 2026 Alexandria Towne and Evidence Hound contributors.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version. It is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See <https://www.gnu.org/licenses/> for the full license.
 *
 * Source: https://github.com/lextechx/evidence-hound
 */

/**
 * Static site generator for Evidence Hound.
 *
 * Reads the JSON evidence files, writes dist/. No dependencies, no build
 * pipeline, no lock file to audit. `node src/build.mjs` is the whole thing.
 */

import { mkdir, writeFile, readFile, rm, copyFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, collectErrors } from "../scripts/validate.mjs";
import {
  layout,
  SITE_URL,
  homePage,
  interventionPage,
  conditionPage,
  methodsPage,
  monitoringPage,
  storyPage,
  dataPage,
  trackPage,
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

  await writePage("index.html", layout(ctx, { title: null, page: homePage(ctx), path: "/" }));

  for (const intervention of interventions) {
    await writePage(
      `interventions/${intervention.id}/index.html`,
      layout(ctx, {
        title: intervention.name,
        description: intervention.plain_summary,
        page: interventionPage(ctx, intervention),
        path: `/interventions/${intervention.id}/`,
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
        path: `/conditions/${id}/`,
      }),
    );
  }

  await writePage("methods/index.html", layout(ctx, { title: "How we grade evidence", page: methodsPage(ctx), path: "/methods/" }));
  await writePage(
    "monitoring/index.html",
    layout(ctx, {
      title: data.monitoring.framework.name,
      description: data.monitoring.framework.premise,
      page: monitoringPage(ctx, data.monitoring),
      path: "/monitoring/",
    }),
  );
  // Photos are optional. A missing or empty manifest simply renders no gallery.
  const photos = await readFile(join(root, "content", "photos.json"), "utf8")
    .then((raw) => JSON.parse(raw).photos ?? [])
    .catch(() => []);

  // Copy only what the manifest names, so notes and stray files in the source
  // folder never get published.
  if (photos.length) {
    await mkdir(join(dist, "photos"), { recursive: true });
    for (const photo of photos) {
      const from = join(root, "assets", "photos", photo.file);
      if (!(await access(from).then(() => true).catch(() => false))) {
        console.error(`  \u2717 photos.json lists "${photo.file}" but assets/photos/${photo.file} is missing`);
        process.exit(1);
      }
      await copyFile(from, join(dist, "photos", photo.file));
    }
  }

  const story = await readFile(join(root, "content", "story.md"), "utf8");
  await writePage(
    "story/index.html",
    layout(ctx, {
      title: "Why this exists",
      description: "The dog this project is named for, and the signals I did not know how to read.",
      page: storyPage(ctx, story, photos),
      path: "/story/",
    }),
  );

  const dataPolicy = await readFile(join(root, "content", "data.md"), "utf8");
  await writePage(
    "data/index.html",
    layout(ctx, {
      title: "How we handle data",
      description: "The evidence is open. Your dog's record is private. Why both, and what we commit to.",
      page: dataPage(ctx, dataPolicy),
      path: "/data/",
    }),
  );

  await writePage(
    "track/index.html",
    layout(ctx, {
      title: "Track your dog",
      description: "A no-install browser tool that turns what you notice at home into a dated report for your vet.",
      page: trackPage(ctx),
      path: "/track/",
    }),
  );

  await writePage("about/index.html", layout(ctx, { title: "About", page: aboutPage(ctx), path: "/about/" }));
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

  const paths = [
    "/",
    "/methods/",
    "/monitoring/",
    "/track/",
    "/story/",
    "/data/",
    "/about/",
    ...Object.keys(data.conditions).map((id) => `/conditions/${id}/`),
    ...interventions.map((i) => `/interventions/${i.id}/`),
  ];
  const today = new Date().toISOString().slice(0, 10);
  await writeFile(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
      .map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`)
      .join("\n")}\n</urlset>\n`,
    "utf8",
  );
  await writeFile(
    join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    "utf8",
  );

  await copyFile(join(root, "src", "site.css"), join(dist, "site.css"));
  await copyFile(join(root, "src", "app.js"), join(dist, "app.js"));
  // Social crawlers do not run JS and mostly refuse SVG, so the preview
  // card ships as a pre-rendered PNG. Regenerate with `npm run og`.
  await copyFile(join(root, "assets", "og.png"), join(dist, "og.png"));
  await writeFile(join(dist, ".nojekyll"), "", "utf8");

  console.log(
    `✓ Built ${interventions.length} interventions and ${Object.keys(data.conditions).length} conditions into dist/`,
  );
}

await build();
