#!/usr/bin/env node
// Guard: Rust compiler and projection crates are compiled into several
// *separate* npm artifacts. Some of them share no npm dependency edge, so
// Changesets cannot cascade a Rust change from one to another — each must be
// named in a changeset explicitly or it silently ships stale.
//
// Concretely, `@rsvelte/svelte-check` embeds the same `rsvelte_projection`
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
    prefix: 'crates/rsvelte/src/',
    // The stable Rust facade is versioned with the compiler release set.
    requires: ['@rsvelte/compiler'],
  },
  {
    prefix: 'crates/rsvelte_core/src/',
    // @rsvelte/compiler owns the shared Rust toolchain release version.
    requires: ['@rsvelte/compiler'],
  },
  {
    prefix: 'crates/rsvelte_core/Cargo.toml',
    // Exact dependency updates create a new compiler release-set artifact.
    requires: ['@rsvelte/compiler'],
  },
  {
    prefix: 'crates/rsvelte_projection/src/',
    // Every projection change must advance the Rust release-set version even
    // when it does not touch the language-tools-compatible converter.
    requires: ['@rsvelte/compiler'],
  },
  {
    prefix: 'crates/rsvelte_projection/src/svelte2tsx/',
    // svelte2tsx code ships two ways: the wasm export consumed by
    // @rsvelte/svelte2tsx, and the overlay generator inside the svelte-check
    // binary. The latter has no cascade edge, so it must be named too.
    requires: ['@rsvelte/compiler', '@rsvelte/svelte2tsx', '@rsvelte/svelte-check'],
  },
  {
    prefix: 'crates/rsvelte_check/src/',
    requires: ['@rsvelte/svelte-check'],
  },
  {
    prefix: 'crates/rsvelte_bindings_support/src/',
    // Only `rsvelte_napi` depends on it, and that ships only as the
    // `rsvelte.node` cdylib -- so this crate writes the binary parse envelope
    // that `@rsvelte/vite-plugin-svelte-native` decodes, and reaches no other
    // artifact. The rule below covers the crate that links it and not the one
    // that writes it, which is how a decoder can ship ahead of its writer.
    requires: ['@rsvelte/vite-plugin-svelte-native'],
  },
  {
    prefix: 'crates/rsvelte_napi/src/',
    // Ships only as the `rsvelte.node` cdylib inside the vps-native binaries,
    // whose fixed group has no dependency edge to any other artifact. A
    // changeset naming `@rsvelte/compiler` republishes wasm that does not
    // contain the change while this one stays on a stale build (#3665).
    requires: ['@rsvelte/vite-plugin-svelte-native'],
  },
  {
    prefix: 'crates/rsvelte_formatter/src/',
    // Two dependents publish artifacts, and they sit in separate `fixed` groups
    // (`@rsvelte/fmt`, and `@rsvelte/language-server` + `rsvelte-vscode`), so
    // naming one leaves the other shipping a stale formatter. `rsvelte_fmt_wasm`
    // is the third dependent and needs no naming for the reason recorded below.
    requires: ['@rsvelte/fmt', '@rsvelte/language-server'],
  },
  {
    prefix: 'crates/rsvelte_fmt/src/',
    requires: ['@rsvelte/fmt'],
  },
  {
    prefix: 'crates/rsvelte_language_server/src/',
    requires: ['@rsvelte/language-server'],
  },
  {
    prefix: 'crates/rsvelte_capi/src/',
    // The C ABI is not on npm, but it is published: `release-capi.yml` attaches
    // five per-OS/arch archives to a `capi-v*` Release. `@rsvelte/capi` is a
    // private carrier whose only job is to let a changeset decide that version
    // (see apps/npm/capi/README.md), so naming it here is what turns "the C ABI
    // changed" into a release rather than into a stale artifact — capi-v0.1.1
    // was the newest tag for three months for exactly that reason (#4285).
    requires: ['@rsvelte/capi'],
  },
  // NOTE: `crates/rsvelte_fmt_wasm/**` is deliberately absent because it is
  // published NOWHERE — it does not appear in release.yml's build matrix, so
  // there is no artifact to leave stale.
  // NOTE: `crates/rsvelte_lint/**` and `crates/rsvelte_lint_bindings/**` are
  // intentionally NOT listed. Their code ships in two separate artifacts — the
  // `@rsvelte/compiler` wasm (`build:wasm:core`, built from the bindings crate)
  // and the native `@rsvelte/lint` CLI — but those two packages share a `fixed`
  // changeset group (`.changeset/config.json`), so naming EITHER one bumps BOTH.
  // There is therefore no islanded-drift edge to guard here: the fixed group
  // cascades the version, unlike the svelte2tsx / svelte-check pair above which
  // live in different groups.
];

function sh(cmd) {
  return execSync(cmd, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function resolveBase() {
  // Never trust a caller-supplied BASE_SHA (github.event.pull_request.base.sha):
  // GitHub sets it once — at PR-open time, or the last time the PR was synced —
  // and it does NOT track the base branch's current tip. On the `pull_request`
  // event, `HEAD` here is actually the ephemeral `refs/pull/<n>/merge` commit
  // (this PR's head merged onto main's tip *as of this run*), so a stale
  // BASE_SHA makes `git diff base...HEAD` include every file changed by every
  // other PR merged into main between BASE_SHA and now — see #1799. The actual
  // merge-base with `origin/main` is always correct, since it resolves to
  // exactly the main-tip parent of that ephemeral merge commit.
  //
  // `+main:refs/remotes/origin/main` force-updates the local ref explicitly
  // rather than relying on the default `origin` fetch refspec, which actions/
  // checkout does not always configure.
  try {
    sh('git fetch --quiet origin +main:refs/remotes/origin/main');
  } catch {
    // Best-effort refresh (e.g. no network in a sandboxed/offline run); fall
    // back to whatever `origin/main` already resolves to locally.
  }
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

// A `fixed` group is one independently-published artifact family. If no rule
// names any member of a group, then no source path maps to it and the guard is
// blind to that whole artifact — which is how `crates/rsvelte_napi` went
// unlisted while its own header explained why it should not be (#3665).
//
// This is a proxy: it answers "did anyone decide about this group", not "is the
// decision right". That is deliberately the question, because the failure being
// guarded is nobody having asked.
export function uncoveredFixedGroups(config) {
  const named = new Set(RULES.flatMap((rule) => rule.requires));
  return config.fixed.filter((group) => !group.some((pkg) => named.has(pkg)));
}

function checkFixedGroupCoverage() {
  const config = JSON.parse(
    readFileSync(path.join(repoRoot, '.changeset', 'config.json'), 'utf8'),
  );
  const uncovered = uncoveredFixedGroups(config);
  if (uncovered.length === 0) return;
  for (const group of uncovered) {
    console.error(
      `::error::No rule in check-core-consumer-changesets.mjs names any package in the ` +
        `fixed group [${group.join(', ')}]. Either add the crate prefix whose code that ` +
        `artifact embeds, or say in a comment why it needs no rule.`,
    );
  }
  process.exit(1);
}

function main() {
  // Not behind SKIP: the table's completeness is a property of the repository,
  // not of the pull request asking to skip its changeset.
  checkFixedGroupCoverage();

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

// Guarded so the coverage helper can be imported by a self-test without the
// script resolving a merge base it does not need.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { RULES };
