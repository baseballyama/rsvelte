#!/usr/bin/env node
// `compatibility/pattern-corpus/README.md` is the ONLY place a repro's
// provenance lives — convention 4 of that directory forbids putting it in the
// file, because a removed HTML comment is itself a whitespace-sensitive
// compiler input (#1975). So a file with no entry carries no explanation of
// which axis it holds, and an entry with no file describes something that is
// not there. Nothing checked either direction until this script; seven
// `issues/` files and fifteen `matrix/` files had drifted out (#3670).
//
// The three sub-corpora are documented in three different shapes, and the check
// is scoped per section rather than run against the whole file — the README has
// several tables whose leading cell is a filename, so a whole-file scan reads a
// `matrix/` row as a missing `issues/` file.
//
//   issues/<file>          ↔ a row in the `## \`issues/\`` table
//   matrix/<group>/<file>  ↔ a row under that group's `### \`<group>/\`` section
//   adversarial/<theme>/   ↔ a row in the `## \`adversarial/\`` themes table
//
// Exit codes: 0 = documented, 1 = drift, 2 = the corpus layout is not what this
// script expects (a new sub-corpus, or a missing directory) — a failure rather
// than a pass, because a check that silently stops looking is worse than none.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORPUS = join(HERE, '..', '..', 'compatibility', 'pattern-corpus');
export const SUBDIRS = ['issues', 'matrix', 'adversarial'];

const ROW_ID = /^\|\s*`([^`]+)`\s*\|/;

function entries(path, wantDir) {
  return readdirSync(path)
    .filter((entry) => statSync(join(path, entry)).isDirectory() === wantDir)
    .sort();
}

/** Ids in the leading cell of every table row between two headings. */
function rowIds(lines, from, to) {
  const ids = new Set();
  for (let i = from; i < to; i++) {
    const match = ROW_ID.exec(lines[i]);
    if (match) ids.add(match[1]);
  }
  return ids;
}

/** Line index of each `## `/`### ` heading, so a section can be sliced out. */
function headings(lines, depth) {
  const prefix = `${'#'.repeat(depth)} `;
  const found = [];
  lines.forEach((line, i) => {
    if (line.startsWith(prefix)) found.push({ i, text: line.slice(prefix.length) });
  });
  return found;
}

function sectionBounds(lines, depth, title) {
  const all = headings(lines, depth);
  const start = all.find((h) => h.text.startsWith(title));
  if (!start) return null;
  const nextSame = all.find((h) => h.i > start.i);
  const shallower = depth > 2 ? headings(lines, depth - 1).find((h) => h.i > start.i) : undefined;
  let end = lines.length;
  if (nextSame) end = Math.min(end, nextSame.i);
  if (shallower) end = Math.min(end, shallower.i);
  return { from: start.i, to: end };
}

/** Both directions of one id set against one directory listing. */
function bijection(label, ids, names, problems) {
  for (const name of names) {
    if (!ids.has(name)) problems.push(`${label}${name} has no row in the README`);
  }
  for (const id of ids) {
    if (!names.includes(id)) problems.push(`README row \`${id}\` under ${label} names nothing on disk`);
  }
}

export function check(corpus) {
  const problems = [];
  const layout = entries(corpus, true);
  const unexpected = layout.filter((entry) => !SUBDIRS.includes(entry));
  if (unexpected.length > 0) {
    return {
      fatal:
        `pattern-corpus has sub-corpora this check does not know about: ${unexpected.join(', ')}. ` +
        'Teach it how they are documented rather than letting them go unchecked.',
      problems,
    };
  }
  for (const name of SUBDIRS) {
    if (!layout.includes(name)) return { fatal: `pattern-corpus/${name}/ is missing`, problems };
  }

  const lines = readFileSync(join(corpus, 'README.md'), 'utf8').split('\n');

  const issues = sectionBounds(lines, 2, '`issues/`');
  if (!issues) return { fatal: 'README has no `## `issues/`` section', problems };
  bijection(
    'issues/',
    rowIds(lines, issues.from, issues.to),
    entries(join(corpus, 'issues'), false),
    problems,
  );

  const matrix = sectionBounds(lines, 2, '`matrix/`');
  if (!matrix) return { fatal: 'README has no `## `matrix/`` section', problems };
  const documentedGroups = headings(lines, 3)
    .filter((h) => h.i > matrix.from && h.i < matrix.to)
    .map((h) => /^`([^`]+)\/`/.exec(h.text)?.[1])
    .filter(Boolean);
  const groups = entries(join(corpus, 'matrix'), true);
  for (const group of groups) {
    if (!documentedGroups.includes(group)) {
      problems.push(`matrix/${group}/ has no \`### \\\`${group}/\\\`\` section in the README`);
      continue;
    }
    const bounds = sectionBounds(lines, 3, `\`${group}/\``);
    bijection(
      `matrix/${group}/`,
      rowIds(lines, bounds.from, bounds.to),
      entries(join(corpus, 'matrix', group), false),
      problems,
    );
  }
  for (const group of documentedGroups) {
    if (!groups.includes(group)) {
      problems.push(`README documents matrix/${group}/, which is not on disk`);
    }
  }

  const adversarial = sectionBounds(lines, 2, '`adversarial/`');
  if (!adversarial) return { fatal: 'README has no `## `adversarial/`` section', problems };
  const themeRows = rowIds(lines, adversarial.from, adversarial.to);
  const themes = entries(join(corpus, 'adversarial'), true);
  for (const theme of themes) {
    if (!themeRows.has(`${theme}/`)) {
      problems.push(`adversarial/${theme}/ has no row in the README themes table`);
    }
  }
  for (const id of themeRows) {
    if (!themes.includes(id.replace(/\/$/, ''))) {
      problems.push(`README themes row \`${id}\` names no directory under adversarial/`);
    }
  }

  return { fatal: null, problems };
}

function main() {
  const { fatal, problems } = check(CORPUS);
  if (fatal) {
    console.error(`::error::${fatal}`);
    return 2;
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`::error::${problem}`);
    console.error(
      `::error::pattern-corpus documentation drift: ${problems.length} problem(s). ` +
        "Provenance lives in the README and nowhere else — see that file's conventions.",
    );
    return 1;
  }
  console.log('pattern-corpus: every repro, group and theme is documented. ✓');
  return 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
