#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = 'crates/rsvelte_esrap/Cargo.toml';
const sourcePrefix = 'crates/rsvelte_esrap/src/';

function git(...args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

function packageVersion(contents, source) {
  const match = contents.match(/\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/);
  if (!match) throw new Error(`Unable to read [package].version from ${source}`);
  return match[1];
}

function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  const width = Math.max(a.length, b.length);
  for (let index = 0; index < width; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

if (process.env.SKIP === 'true') {
  console.log('skip-changeset label present — skipping rsvelte_esrap version check.');
  process.exit(0);
}

try {
  git('fetch', '--quiet', 'origin', '+main:refs/remotes/origin/main');
} catch {
  // Offline/local verification may use the existing remote-tracking ref.
}

let base;
try {
  base = git('merge-base', 'HEAD', 'origin/main');
} catch {
  base = git('merge-base', 'HEAD', 'main');
}

const changed = git('diff', '--name-only', `${base}...HEAD`)
  .split('\n')
  .filter(Boolean);
if (!changed.some((file) => file.startsWith(sourcePrefix))) {
  console.log('rsvelte_esrap source is unchanged.');
  process.exit(0);
}

const previous = packageVersion(git('show', `${base}:${manifestPath}`), `${base}:${manifestPath}`);
const current = packageVersion(
  readFileSync(path.join(repoRoot, manifestPath), 'utf8'),
  manifestPath,
);

if (compareVersions(current, previous) <= 0) {
  console.error(
    `::error::rsvelte_esrap source changed but its crate version did not increase ` +
      `(base ${previous}, current ${current}). Bump ${manifestPath}; the exact ` +
      `rsvelte_core dependency and compiler release-set changeset must advance with it.`,
  );
  process.exit(1);
}

console.log(`rsvelte_esrap source changed and version advanced: ${previous} -> ${current}. ✓`);
