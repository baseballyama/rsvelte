#!/usr/bin/env node
// `upstream_issues/` holds defect reports written against Svelte, oxc/oxfmt,
// `language-tools`, `eslint-plugin-svelte` and `svelte-eslint-parser`. Two
// things about it were unrecorded and one had already drifted (#3680): nothing
// said whether a report had been filed upstream, 26 of 27 files were linked
// from nowhere, and two reports existed twice.
//
// The index carries what the filenames cannot: which project a report is
// addressed to, which rsvelte issue it came from, and — the column that exists
// for #3680 — whether the report was actually filed. That last one must be a
// URL or the literal `unrecorded`; a blank is rejected, so "nobody wrote it
// down" cannot be spelled the same way as "we looked and it is not filed".
//
// The numeric prefix is deliberately NOT required to be unique: one rsvelte
// issue can produce two reports to two different projects, which is what
// `3451-oxc-*` and `3451-oxfmt-*` are. A guard forbidding it would be wrong in
// the direction that deletes work.
//
// Exit codes: 0 = documented, 1 = drift, 2 = the index is not in the shape this
// script understands — a failure rather than a pass, because a check that
// silently stops looking is worse than none.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DIR = join(HERE, '..', '..', 'upstream_issues');
export const INDEX = 'README.md';

// `| `file.md` | project | issue | filed |`
const ROW = /^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/;
const FILED_OK = /^(https:\/\/\S+|unrecorded)$/;
// A link back to THIS repository is what all six URL-bearing reports actually
// carry, and pasting one into `filed` would read as an upstream filing while
// pointing at the issue the report came from. That is the exact confusion the
// column exists to prevent, so the one URL shape it must refuse is our own.
const OWN_REPO = /github\.com\/baseballyama\/rsvelte\//;
// The `rsvelte issue` cell for a report that came out of a campaign rather than
// an issue, and the prose count the index states for those rows.
const NO_ISSUE = '\u2014';
const CLAIMED_UNNUMBERED = /\*\*(\d+)\*\* reports carry no rsvelte issue number/;

/** Report files on disk, in sorted order. The index itself is not one. */
export function reportsOnDisk(dir) {
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.md') && entry !== INDEX)
    .sort();
}

/** Every table row in the index, as `{ file, project, issue, filed }`. */
export function indexRows(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    const match = ROW.exec(line);
    if (!match) continue;
    rows.push({
      file: match[1],
      project: match[2].trim(),
      issue: match[3].trim(),
      filed: match[4].trim(),
    });
  }
  return rows;
}

export function check(dir) {
  const problems = [];
  let text;
  try {
    text = readFileSync(join(dir, INDEX), 'utf8');
  } catch {
    return { problems: [`${INDEX} is missing — there is no index to check against`], fatal: true };
  }

  const files = reportsOnDisk(dir);
  const rows = indexRows(text);
  if (rows.length === 0) {
    return { problems: [`${INDEX} has no table rows this script recognises`], fatal: true };
  }

  const named = rows.map((row) => row.file);
  for (const file of files) {
    if (!named.includes(file)) problems.push(`${file} has no row in ${INDEX}`);
  }
  for (const row of rows) {
    if (!files.includes(row.file)) problems.push(`${INDEX} row \`${row.file}\` names no file on disk`);
  }
  for (const [i, file] of named.entries()) {
    if (named.indexOf(file) !== i) problems.push(`${INDEX} lists \`${file}\` more than once`);
  }

  // The point of the index: an unrecorded filing must SAY it is unrecorded.
  for (const row of rows) {
    if (!row.project) problems.push(`${INDEX} row \`${row.file}\` names no upstream project`);
    if (!FILED_OK.test(row.filed)) {
      problems.push(
        `${INDEX} row \`${row.file}\` has filed=${JSON.stringify(row.filed)} — want a URL or \`unrecorded\``,
      );
    } else if (OWN_REPO.test(row.filed)) {
      problems.push(
        `${INDEX} row \`${row.file}\` has filed=${JSON.stringify(row.filed)} — that is this repository, not an upstream tracker`,
      );
    }
  }

  // A count stated in prose goes stale silently, and this one already had: it
  // read "Fifteen" while 19 rows carried `\u2014`.
  const unnumbered = rows.filter((row) => row.issue === NO_ISSUE).length;
  const claimed = CLAIMED_UNNUMBERED.exec(text);
  if (!claimed) {
    problems.push(
      `${INDEX} no longer states how many rows carry \`${NO_ISSUE}\` \u2014 want \`**<n>** reports carry no rsvelte issue number\``,
    );
  } else if (Number(claimed[1]) !== unnumbered) {
    problems.push(
      `${INDEX} says **${claimed[1]}** reports carry no rsvelte issue number, but ${unnumbered} rows carry \`${NO_ISSUE}\``,
    );
  }

  return { problems, fatal: false };
}

function main() {
  const { problems, fatal } = check(DIR);
  if (problems.length === 0) {
    const n = reportsOnDisk(DIR).length;
    console.log(`upstream_issues: ${n} reports, all indexed with an explicit filing state`);
    return 0;
  }
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(`\n${problems.length} problem(s). Update upstream_issues/${INDEX}.`);
  return fatal ? 2 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main());
