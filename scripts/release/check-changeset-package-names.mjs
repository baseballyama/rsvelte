#!/usr/bin/env node
// Guard: a changeset naming a package that is not in the pnpm workspace is not
// rejected by `changeset add`/review — it detonates later, on `main`, when the
// Release workflow tries to assemble a release plan:
//
//   🦋  error Error: Found changeset css-render-site-ancestry for package
//       @rsvelte/check which is not in the workspace
//
// That failure blocks every subsequent release until someone lands a fix, so
// the name must be validated on the PR instead. Names are checked against the
// `name` field of every workspace package.json, resolved from the
// pnpm-workspace.yaml globs so a new workspace glob needs no change here.
//
// Bypass with the `skip-changeset` label (same as the sibling guards), which
// sets SKIP=true.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function workspaceGlobs() {
  const text = readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');
  const globs = [];
  let inPackages = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*$/, '').trimEnd();
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const m = line.match(/^\s*-\s*['"]?([^'"\s]+)['"]?\s*$/);
      if (m) globs.push(m[1]);
      else if (line.trim() !== '') break;
    }
  }
  return globs;
}

// Only the shapes pnpm-workspace.yaml actually uses here: a literal directory
// or a single trailing `*` segment. Anything else is reported rather than
// silently narrowing the valid-name set.
function expandGlob(glob) {
  const segments = glob.split('/');
  let dirs = [repoRoot];
  for (const segment of segments) {
    if (segment === '**') throw new Error(`unsupported workspace glob: ${glob}`);
    const next = [];
    for (const dir of dirs) {
      if (segment === '*') {
        if (!existsSync(dir)) continue;
        for (const entry of readdirSync(dir)) {
          const child = path.join(dir, entry);
          if (statSync(child).isDirectory()) next.push(child);
        }
      } else {
        const child = path.join(dir, segment);
        if (existsSync(child) && statSync(child).isDirectory()) next.push(child);
      }
    }
    dirs = next;
  }
  return dirs;
}

function workspacePackages() {
  const names = new Set();
  for (const glob of workspaceGlobs()) {
    for (const dir of expandGlob(glob)) {
      const manifest = path.join(dir, 'package.json');
      if (!existsSync(manifest)) continue;
      const { name } = JSON.parse(readFileSync(manifest, 'utf8'));
      if (name) names.add(name);
    }
  }
  return names;
}

function changesetEntries() {
  const dir = path.join(repoRoot, '.changeset');
  const entries = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    const text = readFileSync(path.join(dir, file), 'utf8');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    for (const line of m[1].split('\n')) {
      const pkg = line.match(/^\s*["']?(@?[^"':]+)["']?\s*:/);
      if (pkg) entries.push({ file: `.changeset/${file}`, pkg: pkg[1].trim() });
    }
  }
  return entries;
}

function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length];
}

const unscoped = (name) => name.replace(/^@[^/]+\//, '');

function closestMatch(name, known) {
  const bare = unscoped(name);
  let best = null;
  let bestScore = Infinity;
  for (const candidate of known) {
    const other = unscoped(candidate);
    const raw = distance(name, candidate);
    // A dropped/added name part ("check" vs "svelte-check") costs more edits
    // than an unrelated short name, so containment outranks raw edit distance.
    const contains = bare.includes(other) || other.includes(bare);
    const score = contains ? Math.min(raw, 1) + other.length / 1000 : raw;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  // Beyond half the name's length the "suggestion" is noise, not a typo fix.
  return bestScore <= Math.max(3, Math.ceil(name.length / 2)) ? best : null;
}

function main() {
  if (process.env.SKIP === 'true') {
    console.log('skip-changeset label present — skipping changeset package-name check.');
    return;
  }

  const known = workspacePackages();
  const entries = changesetEntries();

  if (entries.length === 0) {
    console.log('No pending changesets to validate.');
    return;
  }

  const bad = entries.filter((e) => !known.has(e.pkg));

  console.log(`Validating ${entries.length} changeset package reference(s) against the workspace:`);
  for (const { file, pkg } of entries) {
    console.log(`  ${known.has(pkg) ? '✓' : '✗'} ${pkg}  (${file})`);
  }

  if (bad.length > 0) {
    for (const { file, pkg } of bad) {
      const suggestion = closestMatch(pkg, known);
      console.error(
        `::error file=${file}::${file} names "${pkg}", which is not a package in this ` +
          `workspace.` +
          (suggestion ? ` Did you mean "${suggestion}"?` : '') +
          ` The Release workflow fails with "Found changeset <name> for package ${pkg} ` +
          `which is not in the workspace" and no Release PR can be produced until it is ` +
          `fixed. Use the exact "name" field from the package's package.json.`,
      );
    }
    process.exit(1);
  }

  console.log('All changeset package names exist in the workspace. ✓');
}

main();
