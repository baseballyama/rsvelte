#!/usr/bin/env node
// Report test/bin executables in `target/*/deps` that no target in the CURRENT
// checkout can produce. Reports only — it never deletes.
//
// `cargo clean -p <crate>` enumerates targets from the manifest, so it cannot
// reclaim a binary whose source has been deleted or does not exist on this
// branch. Those accumulate at ~50 MiB each in this repo (one test binary per
// integration-test file, each statically linking the whole compiler).
//
// Read the caveats printed at the end before deleting anything. In particular
// an "orphan" here is frequently a LIVE target on another branch — it is that
// checkout's cache, not garbage, and removing it costs a rebuild there.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const targetDirArg = args.find((a) => a.startsWith('--target-dir='));

// Cargo appends `-<16 hex>` to every compiled unit's file stem.
const HASHED = /^(.+)-[0-9a-f]{16}$/;
// Build scripts are legitimate and never match a manifest target name.
const ALWAYS_LIVE = new Set(['build_script_build', 'build_script_main']);

function metadata() {
  const out = execFileSync(
    'cargo',
    ['metadata', '--no-deps', '--format-version', '1'],
    { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
  );
  return JSON.parse(out);
}

const meta = metadata();
const targetRoot = targetDirArg
  ? targetDirArg.slice('--target-dir='.length)
  : meta.target_directory;

// Every stem the current checkout can produce. Cargo normalizes `-` to `_` in
// file stems, and a lib's unit-test binary is named after the lib itself.
const liveStems = new Set(ALWAYS_LIVE);
for (const pkg of meta.packages) {
  for (const t of pkg.targets) {
    liveStems.add(t.name.replace(/-/g, '_'));
  }
}

function isExecutable(p) {
  try {
    const st = fs.statSync(p);
    return st.isFile() && (st.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

const orphans = [];
const supersededCounts = new Map(); // live stem -> number of built binaries

for (const profile of fs.existsSync(targetRoot) ? fs.readdirSync(targetRoot) : []) {
  const deps = path.join(targetRoot, profile, 'deps');
  if (!fs.existsSync(deps)) continue;
  for (const name of fs.readdirSync(deps)) {
    // Anything with a further extension (.rlib/.d/.o/.dylib/.rmeta) is not a
    // test/bin executable.
    if (name.includes('.')) continue;
    const m = HASHED.exec(name);
    if (!m) continue;
    const full = path.join(deps, name);
    if (!isExecutable(full)) continue;
    const stem = m[1];
    const size = fs.statSync(full).size;
    const mtime = fs.statSync(full).mtime;
    if (liveStems.has(stem)) {
      supersededCounts.set(stem, (supersededCounts.get(stem) ?? 0) + 1);
    } else {
      orphans.push({ path: full, stem, size, mtime: mtime.toISOString() });
    }
  }
}

orphans.sort((a, b) => b.size - a.size);
const total = orphans.reduce((s, o) => s + o.size, 0);
const mib = (n) => (n / 1048576).toFixed(1);

if (asJson) {
  console.log(JSON.stringify({ targetRoot, total, orphans }, null, 2));
  process.exit(0);
}

console.log(`target dir: ${targetRoot}`);
console.log(`live target stems in this checkout: ${liveStems.size}\n`);

if (orphans.length === 0) {
  console.log('No orphaned executables found.');
} else {
  console.log(`${orphans.length} executable(s) no target in this checkout can produce:\n`);
  for (const o of orphans) {
    console.log(`  ${mib(o.size).padStart(7)} MiB  ${o.mtime.slice(0, 16)}  ${path.basename(o.path)}`);
  }
  console.log(`\n  total: ${mib(total)} MiB`);
}

const multi = [...supersededCounts.entries()].filter(([, n]) => n > 1);
if (multi.length > 0) {
  console.log(
    `\n${multi.length} live target(s) have more than one built binary ` +
      `(superseded builds; cargo owns which is current — not reported as orphans):`
  );
  for (const [stem, n] of multi.sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  ${String(n).padStart(3)}x  ${stem}`);
  }
}

console.log(`
Before deleting any of the above, note:

  * An orphan is often a LIVE target on ANOTHER branch. Its source exists in the
    repository but not in this checkout, and it is indistinguishable by name from
    real garbage. Deleting it costs that branch a rebuild — it is another
    checkout's cache, not junk.
  * Only a binary whose test file was deleted outright is unambiguously dead, and
    this tool cannot tell the two apart. That is why it does not delete.
  * Superseded builds of live targets are listed separately and deliberately not
    counted: which hash is current is cargo's bookkeeping, not ours.

To reclaim space safely, prefer:

  cargo clean -p <crate>     # drops that crate, keeps the dependency graph
  cargo test -p <c> --test <name>   # build one test binary, not all of them
`);
