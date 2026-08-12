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

/** Preview server for dist/. Node's built-in http, nothing else. */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  // normalize() collapses any ../ before we touch the filesystem.
  const requested = normalize(decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  let target = join(dist, requested);

  try {
    if ((await stat(target).catch(() => null))?.isDirectory()) target = join(target, "index.html");
    if (!extname(target)) target = `${target}.html`;
    if (!target.startsWith(dist)) throw new Error("outside dist");

    const body = await readFile(target);
    res.writeHead(200, { "content-type": TYPES[extname(target)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    const notFound = await readFile(join(dist, "404.html")).catch(() => "Not found");
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(notFound);
  }
});

server.listen(port, () => console.log(`Evidence Hound preview → http://localhost:${port}`));
