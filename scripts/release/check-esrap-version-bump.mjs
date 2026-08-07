#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = 'crates/rsvelte_esrap/Cargo.toml';

export const LIB_PATH = 'crates/rsvelte_esrap/src/lib.rs';
export const SOURCE_PREFIX = 'crates/rsvelte_esrap/src/';
// Under `src/` but `#[cfg(test)]`-gated in lib.rs, so it cannot reach a published artifact.
export const TEST_ONLY_PREFIXES = ['crates/rsvelte_esrap/src/internal_tests/'];

const TEST_ONLY_GATE = /#\[cfg\(test\)\]\s*(?:\/\/[^\n]*\n\s*)*mod\s+internal_tests\s*;/;

function git(...args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

export function packageVersion(contents, source) {
  const match = contents.match(/\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/);
  if (!match) throw new Error(`Unable to read [package].version from ${source}`);
  return match[1];
}

export function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  const width = Math.max(a.length, b.length);
  for (let index = 0; index < width; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** True when lib.rs still declares the excluded directory behind `#[cfg(test)]`. */
export function declaresTestOnlyModule(libSource) {
  return TEST_ONLY_GATE.test(libSource);
}

export function classifyChangedFiles(changed) {
  const changedSource = changed.filter((file) => file.startsWith(SOURCE_PREFIX));
  const shippedSource = changedSource.filter(
    (file) => !TEST_ONLY_PREFIXES.some((prefix) => file.startsWith(prefix)),
  );
  return {
    changedSource,
    shippedSource,
    // The exclusion only has to be justified on runs where it actually dropped a file.
    exclusionLoadBearing: shippedSource.length !== changedSource.length,
  };
}

export const STALE_EXCLUSION_MESSAGE =
  `${TEST_ONLY_PREFIXES.join(', ')} is excluded from this check because ${LIB_PATH} declares ` +
  '`#[cfg(test)] mod internal_tests;`. That declaration is gone, so the directory can now ' +
  'ship — remove the exclusion from this script.';

function main() {
  if (process.env.SKIP === 'true') {
    console.log('skip-changeset label present — skipping rsvelte_esrap version check.');
    return 0;
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
  const { shippedSource, exclusionLoadBearing } = classifyChangedFiles(changed);

  if (exclusionLoadBearing) {
    const lib = readFileSync(path.join(repoRoot, LIB_PATH), 'utf8');
    if (!declaresTestOnlyModule(lib)) {
      console.error(`::error::${STALE_EXCLUSION_MESSAGE}`);
      return 1;
    }
  }

  if (shippedSource.length === 0) {
    console.log('rsvelte_esrap shipped source is unchanged.');
    return 0;
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
    return 1;
  }

  console.log(`rsvelte_esrap source changed and version advanced: ${previous} -> ${current}. ✓`);
  return 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
