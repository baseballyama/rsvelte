#!/usr/bin/env node
// Controls for `check-upstream-issues.mjs`. A guard whose pass is spelled as
// silence is indistinguishable from a guard that never ran, so every failure
// mode it exists to catch is reproduced here against a synthetic directory.
//
// The discriminating pair is `a near-miss filename is not a match` against
// `the exact filenames are accepted`: a substring or prefix comparison passes
// the second and must fail the first.

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { check, indexRows, reportsOnDisk } from './check-upstream-issues.mjs';

let failures = 0;
function ok(label, condition) {
  if (condition) return;
  failures++;
  console.error(`  FAIL ${label}`);
}

/** A throwaway `upstream_issues/` with `files` on disk and `index` as README. */
function corpus(files, index) {
  const dir = mkdtempSync(join(tmpdir(), 'upstream-issues-'));
  for (const file of files) writeFileSync(join(dir, file), '# report\n');
  if (index !== null) writeFileSync(join(dir, 'README.md'), index);
  return dir;
}

function table(rows) {
  return [
    '# Upstream defect reports',
    '',
    '| file | upstream project | rsvelte issue | filed |',
    '|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

const GOOD = table([
  '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | unrecorded |',
  '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | https://github.com/oxc-project/oxc/issues/9 |',
]);
const FILES = ['3001-svelte-a.md', '3002-oxc-b.md'];

const cases = [];
function scenario(label, files, index, expect) {
  const dir = corpus(files, index);
  try {
    const result = check(dir);
    cases.push({ label, result, expect });
    expect(result, label);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const clean = (r, l) => ok(l, r.problems.length === 0 && !r.fatal);
const dirty = (needle) => (r, l) =>
  ok(`${l} (got ${JSON.stringify(r.problems)})`, r.problems.some((p) => p.includes(needle)));

scenario('a correct index passes', FILES, GOOD, clean);

scenario(
  'a file with no row is reported',
  [...FILES, '3003-svelte-c.md'],
  GOOD,
  dirty('3003-svelte-c.md has no row'),
);

scenario(
  'a row naming no file is reported',
  ['3001-svelte-a.md'],
  GOOD,
  dirty('names no file on disk'),
);

// The discriminating pair: a prefix/substring comparison passes the second of
// these and must fail the first.
scenario(
  'a near-miss filename is not a match',
  ['3001-svelte-a.md', '3002-oxc-bb.md'],
  GOOD,
  dirty('3002-oxc-bb.md has no row'),
);
scenario('the exact filenames are accepted', FILES, GOOD, clean);

scenario(
  'a blank filed column is rejected',
  FILES,
  table([
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 |  |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  dirty('want a URL or'),
);

scenario(
  'a prose filing state is rejected — the vocabulary is fixed',
  FILES,
  table([
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | probably reported |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  dirty('want a URL or'),
);

// The one URL shape that must be refused. All six URL-bearing reports on disk
// carry a link back to this repository, so this is the mistake most available
// to whoever fills the column in next — and it passes a naive `https://` test.
scenario(
  'a link back to this repository is not an upstream filing',
  FILES,
  table([
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | https://github.com/baseballyama/rsvelte/issues/3001 |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  dirty('that is this repository'),
);
scenario(
  'a genuine upstream URL is accepted',
  FILES,
  table([
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | https://github.com/sveltejs/svelte/issues/9 |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  clean,
);

scenario(
  'a missing project is reported',
  FILES,
  table([
    '| `3001-svelte-a.md` |  | #3001 | unrecorded |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  dirty('names no upstream project'),
);

scenario(
  'a file listed twice is reported',
  FILES,
  table([
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | unrecorded |',
    '| `3001-svelte-a.md` | sveltejs/svelte | #3001 | unrecorded |',
    '| `3002-oxc-b.md` | oxc-project/oxc | #3002 | unrecorded |',
  ]),
  dirty('more than once'),
);

// A shared numeric prefix is LEGAL — one rsvelte issue, two upstream projects.
// A guard that forbade it would be wrong in the direction that deletes work.
scenario(
  'two reports sharing a numeric prefix are accepted',
  ['3451-oxc-a.md', '3451-oxfmt-b.md'],
  table([
    '| `3451-oxc-a.md` | oxc-project/oxc | #3451 | unrecorded |',
    '| `3451-oxfmt-b.md` | oxc-project/oxc (`oxfmt`) | #3451 | unrecorded |',
  ]),
  clean,
);

scenario('a missing index is fatal, not a pass', FILES, null, (r, l) =>
  ok(l, r.fatal && r.problems.length > 0),
);

scenario('an index with no recognised rows is fatal, not a pass', FILES, '# Nothing here\n', (r, l) =>
  ok(l, r.fatal && r.problems.length > 0),
);

// The index must never count itself as a report.
{
  const dir = corpus(FILES, GOOD);
  try {
    ok('README.md is not itself a report', !reportsOnDisk(dir).includes('README.md'));
    ok('both reports are seen', reportsOnDisk(dir).length === 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

ok('a row with no trailing pipe is not parsed as a row', indexRows('| `a.md` | p | #1 | unrecorded').length === 0);
ok('a non-table line is not parsed as a row', indexRows('see `a.md` for details').length === 0);

console.log(
  failures === 0
    ? `check-upstream-issues: ${cases.length + 4} checks passed`
    : `check-upstream-issues: ${failures} check(s) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
