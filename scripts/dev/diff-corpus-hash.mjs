#!/usr/bin/env node
// Compare two `corpus_hash` runs for byte identity.
//
//   node scripts/dev/diff-corpus-hash.mjs <base.txt> <arm.txt>
//
// Two guards, both for failures that have actually happened here:
//
//  1. **The labels must differ.** `cargo build … | tail -3 && cp …` takes `tail`'s
//     exit status, so a failed build reports success and copies a stale binary —
//     and the comparison then diffs a build against itself and reports a perfect
//     zero. A zero from one binary is indistinguishable from a zero from two.
//  2. **Both files must carry a label.** Without it a run cannot say which build
//     it measured, and diffing a new arm against a stale baseline attributes the
//     base's own drift to the change under test.
//
// Exit 0 = identical, 1 = differences, 2 = the comparison itself is invalid.

import { readFileSync } from 'node:fs';

const [, , basePath, armPath] = process.argv;
if (!basePath || !armPath) {
  console.error('usage: diff-corpus-hash.mjs <base.txt> <arm.txt>');
  process.exit(2);
}

function load(path) {
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  const header = lines.find((l) => l.startsWith('# corpus_hash '));
  if (!header) {
    console.error(`${path}: no '# corpus_hash' header — rerun with --label`);
    process.exit(2);
  }
  const label = /label=(\S+)/.exec(header)?.[1];
  const mode = /mode=(\S+)/.exec(header)?.[1];
  const dev = /dev=(\S+)/.exec(header)?.[1];
  return { label, mode, dev, rows: lines.filter((l) => !l.startsWith('#')) };
}

const base = load(basePath);
const arm = load(armPath);

if (base.label === arm.label) {
  console.error(
    `both files are labelled '${base.label}' — this compares a build against ` +
      `itself and will report 0 differences whatever the change does`,
  );
  process.exit(2);
}
if (base.mode !== arm.mode || base.dev !== arm.dev) {
  console.error(
    `target mismatch: ${base.mode}/dev=${base.dev} vs ${arm.mode}/dev=${arm.dev}`,
  );
  process.exit(2);
}
if (base.rows.length !== arm.rows.length) {
  console.error(`file-count mismatch: ${base.rows.length} vs ${arm.rows.length}`);
  process.exit(2);
}

let differing = 0;
for (let i = 0; i < base.rows.length; i++) {
  if (base.rows[i] !== arm.rows[i]) differing++;
}

console.log(
  `${base.label} → ${arm.label}  ${base.mode}${base.dev === 'true' ? '-dev' : ''}  ` +
    `${base.rows.length} files  ${differing === 0 ? 'IDENTICAL' : `${differing} DIFFER`}`,
);
process.exit(differing === 0 ? 0 : 1);
