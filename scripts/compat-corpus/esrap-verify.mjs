#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TARGETS } from "./targets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);

function argument(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const compatibility = path.resolve(
  argument("--compatibility-dir", path.join(root, "compatibility")),
);
const manifestPath = path.join(compatibility, "manifest.json");
const minimumPerTreeTarget = Number(argument("--minimum-per-tree-target", "12000"));
if (!Number.isInteger(minimumPerTreeTarget) || minimumPerTreeTarget < 1) {
  throw new Error("--minimum-per-tree-target must be a positive integer");
}
if (!fs.existsSync(manifestPath)) {
  throw new Error("compatibility/manifest.json is missing; run pnpm corpus:collect first");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const populations = [];
for (const tree of ["expected", "actual"]) {
  for (const target of TARGETS) {
    const population = [];
    for (const { id } of manifest) {
      const candidate = path.join(compatibility, tree, id, `${target.key}.js`);
      if (fs.existsSync(candidate)) population.push(candidate);
    }
    if (population.length < minimumPerTreeTarget) {
      throw new Error(
        `${tree}/${target.key} contains ${population.length} JavaScript outputs; expected at least ${minimumPerTreeTarget}`,
      );
    }
    populations.push({ tree, target: target.key, paths: population });
  }
}

const stage = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-esrap-corpus-"));

try {
  const binary = path.resolve(argument("--binary", path.join(root, "target/release/esrap_corpus")));
  if (!fs.existsSync(binary)) {
    throw new Error(
      "target/release/esrap_corpus is missing; build the rsvelte_devtools binary first",
    );
  }
  const measured = populations.map((population, index) => {
    const fileList = path.join(stage, `files-${index}.txt`);
    fs.writeFileSync(fileList, `${population.paths.join("\n")}\n`);
    const output = execFileSync(
      binary,
      [
        "--files",
        fileList,
        "--minimum-files",
        String(minimumPerTreeTarget),
        "--minimum-comment-files",
        "1",
      ],
      { cwd: root, encoding: "utf8", maxBuffer: 1 << 24 },
    );
    return {
      tree: population.tree,
      target: population.target,
      ...JSON.parse(output),
    };
  });
  const printer = measured.reduce(
    (totals, population) => {
      for (const key of ["files", "bytes", "commentFiles", "comments", "mappedFiles", "mappings"]) {
        totals[key] += population[key];
      }
      return totals;
    },
    { files: 0, bytes: 0, commentFiles: 0, comments: 0, mappedFiles: 0, mappings: 0 },
  );
  const report = {
    schemaVersion: 1,
    kind: "rsvelte-esrap-corpus-report",
    manifestEntries: manifest.length,
    minimumPerTreeTarget,
    populations: measured,
    printer,
  };
  const reportPath = path.join(compatibility, "esrap-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, "\t")}\n`);
  console.log(
    `esrap corpus passed: ${printer.files} outputs, ${printer.commentFiles} comment-bearing, ${printer.mappings} mappings`,
  );
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
