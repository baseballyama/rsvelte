#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeCurrentArtifacts, readArtifacts } from "./artifacts.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const args = process.argv.slice(2);
const UPDATE = args.includes("--update-baseline");
const directory = args.find((arg) => !arg.startsWith("--"));
if (!directory)
  throw new Error(
    "usage: merge-current.mjs ARTIFACT_DIRECTORY [--update-baseline]",
  );
const floor = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "scripts/compat-lsp/corpus-population.json"),
    "utf8",
  ),
);
const merged = mergeCurrentArtifacts(
  readArtifacts(path.resolve(directory)),
  floor,
);
const baseline = path.join(ROOT, "compatibility/lsp-known-failures.json");
const sidecar = path.join(ROOT, "compatibility/lsp-mechanisms.json");
if (UPDATE) {
  const temporary = `${baseline}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporary,
    JSON.stringify(merged.current, null, "\t") + "\n",
  );
  fs.renameSync(temporary, baseline);
  console.log(
    `[lsp-merge] wrote ${merged.current.length} entries to ${path.relative(ROOT, baseline)}`,
  );
  // The two files are written by one command on purpose: a sidecar refreshed
  // separately from the ratchet is a map of a population that no longer exists,
  // and nothing downstream could tell the two apart.
  const document = JSON.parse(fs.readFileSync(sidecar, "utf8"));
  const labels = new Set(Object.values(merged.mechanisms).flat());
  for (const label of [...labels].sort())
    document.mechanisms[label] ??= { terminal: null };
  document.entries = Object.fromEntries(
    Object.entries(merged.mechanisms).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const sidecarTemporary = `${sidecar}.${process.pid}.tmp`;
  fs.writeFileSync(
    sidecarTemporary,
    JSON.stringify(document, null, "\t") + "\n",
  );
  fs.renameSync(sidecarTemporary, sidecar);
  console.log(
    `[lsp-merge] wrote ${Object.keys(document.entries).length} mechanism sets over ${labels.size} labels to ${path.relative(ROOT, sidecar)}`,
  );
} else {
  const known = JSON.parse(fs.readFileSync(baseline, "utf8"));
  const knownSet = new Set(known);
  const currentSet = new Set(merged.current);
  const added = merged.current.filter((entry) => !knownSet.has(entry));
  const removed = known.filter((entry) => !currentSet.has(entry));
  console.log(
    `[lsp-merge] ${merged.current.length} current, ${added.length} new, ${removed.length} stale`,
  );
  if (added.length || removed.length) process.exitCode = 1;
}
