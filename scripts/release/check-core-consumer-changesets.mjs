#!/usr/bin/env node
// Guard: a single Rust crate (`rsvelte_core`) is compiled into several
// *separate* npm artifacts. Some of them share no npm dependency edge, so
// Changesets cannot cascade a core change from one to another — each must be
// named in a changeset explicitly or it silently ships stale.
//
// Concretely, `@rsvelte/svelte-check` embeds the same `rsvelte_core` svelte2tsx
// code that `@rsvelte/svelte2tsx` (via the `@rsvelte/compiler` wasm) exposes,
// but svelte-check is a self-contained native binary with no dependency on
// either package. A changeset naming only `@rsvelte/svelte2tsx` can therefore
// republish that package with a fix while `@rsvelte/svelte-check` stays on a
// stale build and ships different diagnostics.
//
// This script maps changed core source directories to the set of npm packages
// that embed them WITHOUT a cascade edge, and fails if the pending changesets
// don't collectively name every required package. It is intentionally narrow:
// only edges that are proven to drift are enforced, to avoid forcing a
// multi-package changeset on every routine compiler PR.
//
// Bypass with the `skip-changeset` label (same as the sibling changeset guard),
// which sets SKIP=true.

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Source-directory prefix → npm packages that embed it but do NOT receive a
// Changesets cascade for it. List EVERY package that must bump, including ones
// that are usually named anyway; naming the obvious one is cheap and keeps the
// rule self-documenting.
//
// To extend: add a prefix and its islanded consumers. Islanded = its
// package.json has no `@rsvelte/*` dependency that would cascade the bump
// (today: @rsvelte/compiler, @rsvelte/svelte-check, @rsvelte/vite-plugin-svelte-native,
// @rsvelte/language-server). Packages that DO cascade (@rsvelte/svelte2tsx →
// @rsvelte/compiler, @rsvelte/vite-plugin-svelte → …-native) don't need listing
// unless you want them named directly.
const RULES = [
  {
    prefix: 'crates/rsvelte_core/src/svelte2tsx/',
    // svelte2tsx code ships two ways: the wasm export consumed by
    // @rsvelte/svelte2tsx, and the overlay generator inside the svelte-check
    // binary. The latter has no cascade edge, so it must be named too.
    requires: ['@rsvelte/svelte2tsx', '@rsvelte/svelte-check'],
  },
  {
    prefix: 'crates/rsvelte_core/src/svelte_check/',
    requires: ['@rsvelte/svelte-check'],
  },
  // NOTE: `crates/rsvelte_lint/**` is intentionally NOT listed. That crate is
  // compiled into two separate artifacts — the `@rsvelte/compiler` wasm
  // (`build:wasm:core`) and the native `@rsvelte/lint` CLI — but those two
  // packages share a `fixed` changeset group (`.changeset/config.json`), so
  // naming EITHER one bumps BOTH. There is therefore no islanded-drift edge to
  // guard here: the fixed group cascades the version, unlike the svelte2tsx /
  // svelte-check pair above which live in different groups.
];

function sh(cmd) {
  return execSync(cmd, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function resolveBase() {
  if (process.env.BASE_SHA) return process.env.BASE_SHA;
  try {
    return sh('git merge-base HEAD origin/main');
  } catch {
    return sh('git merge-base HEAD main');
  }
}

function changedFiles(base) {
  const out = sh(`git diff --name-only ${base}...HEAD`);
  return out ? out.split('\n').filter(Boolean) : [];
}

// Names in the frontmatter of every pending changeset (working-tree state — the
// set the Release workflow will consume), not just ones added in this PR.
function namedPackages() {
  const dir = path.join(repoRoot, '.changeset');
  const named = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    const text = readFileSync(path.join(dir, file), 'utf8');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    for (const line of m[1].split('\n')) {
      const pkg = line.match(/^\s*["']?(@[^"':]+)["']?\s*:/);
      if (pkg) named.add(pkg[1]);
    }
  }
  return named;
}

function main() {
  if (process.env.SKIP === 'true') {
    console.log('skip-changeset label present — skipping core-consumer changeset check.');
    return;
  }

  const base = resolveBase();
  const files = changedFiles(base);

  const required = new Map(); // package → the prefix that required it
  for (const rule of RULES) {
    if (files.some((f) => f.startsWith(rule.prefix))) {
      for (const pkg of rule.requires) {
        if (!required.has(pkg)) required.set(pkg, rule.prefix);
      }
    }
  }

  if (required.size === 0) {
    console.log('No shared-core source touched that needs an explicit consumer changeset.');
    return;
  }

  const named = namedPackages();
  const missing = [...required].filter(([pkg]) => !named.has(pkg));

  console.log('Shared-core changes require these packages to be named in a changeset:');
  for (const [pkg, prefix] of required) {
    console.log(`  ${named.has(pkg) ? '✓' : '✗'} ${pkg}  (touched: ${prefix})`);
  }

  if (missing.length > 0) {
    const list = missing.map(([pkg]) => pkg).join(', ');
    console.error(
      `::error::These packages embed the changed core code but are missing from the ` +
        `pending changesets: ${list}. They are separately-compiled artifacts of ` +
        `rsvelte_core with no cascade edge, so a core change won't reach them unless ` +
        `named. Add them to a changeset (bump: patch) or apply the 'skip-changeset' label.`,
    );
    process.exit(1);
  }

  console.log('All required consumer packages are named. ✓');
}

main();
