#!/usr/bin/env node
// Analyze how a target repository uses Svelte.
//
// Usage:
//   node analyze-usage.mjs <target-path>
//
// Output: a single JSON object on stdout with the detected metadata.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const target = process.argv[2];
if (!target) {
  console.error("usage: analyze-usage.mjs <target-path>");
  process.exit(64);
}

const targetAbs = path.resolve(target);
if (!fs.existsSync(targetAbs)) {
  console.error(`target not found: ${targetAbs}`);
  process.exit(1);
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(targetAbs, rel));
}

const rootPkg = readJsonSafe(path.join(targetAbs, "package.json")) || {};
const allDeps = {
  ...(rootPkg.dependencies || {}),
  ...(rootPkg.devDependencies || {}),
  ...(rootPkg.peerDependencies || {}),
};

const hasWorkspaces = !!rootPkg.workspaces || fileExists("pnpm-workspace.yaml");
const monorepoPackages = [];
if (hasWorkspaces) {
  // best-effort: scan top-level package directories
  for (const dir of ["packages", "apps", "sites"]) {
    const full = path.join(targetAbs, dir);
    if (fs.existsSync(full)) {
      for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
        if (entry.isDirectory() && fs.existsSync(path.join(full, entry.name, "package.json"))) {
          monorepoPackages.push(`${dir}/${entry.name}`);
        }
      }
    }
  }
}

// Build system detection
let buildSystem = "other";
if (allDeps["@sveltejs/kit"] || fileExists("svelte.config.js") || fileExists("svelte.config.ts")) {
  buildSystem = "kit";
} else if (allDeps["vite"] || fileExists("vite.config.js") || fileExists("vite.config.ts")) {
  buildSystem = "vite";
} else if (allDeps["webpack"]) {
  buildSystem = "webpack";
} else if (allDeps["rollup"]) {
  buildSystem = "rollup";
}

// .svelte file count (skip heavy directories)
function countSvelteFiles(dir, depth = 0) {
  if (depth > 8) return 0;
  let count = 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist" ||
      entry.name === "build" ||
      entry.name === ".svelte-kit" ||
      entry.name === "target" ||
      entry.name.startsWith(".")
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countSvelteFiles(full, depth + 1);
    else if (entry.isFile() && entry.name.endsWith(".svelte")) count += 1;
  }
  return count;
}
const svelteFileCount = countSvelteFiles(targetAbs);

// Detect if this repo imports the Svelte compiler from its own source.
// We look for both `svelte/compiler` (official) and `@rsvelte/compiler`
// (already-swapped fork). Source files only — exclude test directories so
// repos that merely use the compiler in a single test util are classified
// as apps, not tools.
let compilerEntryPoints = [];
let alreadySwapped = false;
try {
  const lsOut = execSync(`git -C "${targetAbs}" ls-files`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const tracked = lsOut.split("\n").filter(Boolean);
  const sourcePat = /\.(js|ts|mjs|mts|cjs|cts)$/;
  const testPat = /(^|\/)(tests?|__tests__|e2e|examples?|fixtures?|spec)(\/|$)/;
  const importPat = /(?:from\s+|require\(\s*)['"](svelte\/compiler|@rsvelte\/compiler)['"]/;
  const rsveltePat = /['"]@rsvelte\/compiler['"]/;
  for (const rel of tracked) {
    if (!sourcePat.test(rel) || testPat.test(rel)) continue;
    let content;
    try {
      content = fs.readFileSync(path.join(targetAbs, rel), "utf8");
    } catch {
      continue;
    }
    if (importPat.test(content)) {
      compilerEntryPoints.push(rel);
      if (rsveltePat.test(content)) alreadySwapped = true;
    }
  }
} catch {
  // ignore
}

// Test/build commands inspection
const scripts = rootPkg.scripts || {};
const testCommands = [];
const buildCommands = [];
for (const key of Object.keys(scripts)) {
  if (/^(test|spec|check)(:|$)/.test(key)) testCommands.push(`pnpm ${key}`);
  if (/^build(:|$)/.test(key) || key === "build") buildCommands.push(`pnpm ${key}`);
}

// Type classification
//   tool      — own source imports svelte/compiler (the repo IS or wraps a Svelte tool)
//   monorepo  — workspace root containing multiple packages; one of them is likely a tool
//   app       — many .svelte components but no compiler import (consumer of Svelte)
let type = "unknown";

if (compilerEntryPoints.length > 0) {
  type = hasWorkspaces && monorepoPackages.length > 1 ? "monorepo" : "tool";
} else if (hasWorkspaces && monorepoPackages.length > 1) {
  type = "monorepo";
} else if (svelteFileCount >= 1) {
  type = "app";
}

const result = {
  name: rootPkg.name || path.basename(targetAbs),
  type,
  alreadySwapped,
  svelteVersion: allDeps["svelte"] || allDeps["@sveltejs/kit"] || null,
  buildSystem,
  compilerEntryPoints,
  testCommands,
  buildCommands,
  svelteFileCount,
  monorepoPackages,
  hasWorkspaces,
  scripts: Object.keys(scripts),
};

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
