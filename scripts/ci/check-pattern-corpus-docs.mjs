#!/usr/bin/env node
// A repro's provenance lives OUTSIDE the repro — convention 4 of that directory
// forbids putting it in the file, because a removed HTML comment is itself a
// whitespace-sensitive compiler input (#1975). For `issues/` that outside place
// is a sibling `<file>.md`; for `matrix/` and `adversarial/` it is still the
// README. The issues table moved out because a single append-only table gives
// every repro PR one shared insertion point, so any two of them conflict
// (#4442). So a file with no entry carries no explanation of
// which axis it holds, and an entry with no file describes something that is
// not there. Nothing checked either direction until this script; seven
// `issues/` files and fifteen `matrix/` files had drifted out (#3670).
//
// The three sub-corpora are documented in three different shapes, and the check
// is scoped per section rather than run against the whole file — the README has
// several tables whose leading cell is a filename, so a whole-file scan reads a
// `matrix/` row as a missing `issues/` file.
//
//   issues/<file>          ↔ a sibling `issues/<file>.md`
//   matrix/<group>/<file>  ↔ a row under that group's `### \`<group>/\`` section
//   adversarial/<theme>/   ↔ a row in the `## \`adversarial/\`` themes table
//
// Exit codes: 0 = documented, 1 = drift, 2 = the corpus layout is not what this
// script expects (a new sub-corpus, or a missing directory) — a failure rather
// than a pass, because a check that silently stops looking is worse than none.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORPUS = join(HERE, '..', '..', 'compatibility', 'pattern-corpus');
const SOURCES = join(HERE, '..', 'compat-corpus', 'corpus-sources.json');
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


const DOC_SUFFIX = '.md';
const ISSUE_LINE = '**Issue:** ';
// A fix whose divergence cannot be written as a repro is recorded as a doc with
// no file (#4449). The line has to name what does guard it, or the record is a
// claim with nothing behind it — which is the state this replaced.
const REPRO_NONE = '**Repro:** none';
const BACKTICKED = /`([^`]+)`/g;

export const ROOT = join(HERE, '..', '..');

/** `{ repros, docs }` for `issues/`, split on the doc suffix. */
function issueEntries(corpus) {
  const all = entries(join(corpus, 'issues'), false);
  return {
    repros: all.filter((name) => !name.endsWith(DOC_SUFFIX)),
    docs: all.filter((name) => name.endsWith(DOC_SUFFIX)),
  };
}

/**
 * Read one sibling doc into the cells the README table used to hold, plus the
 * `**Repro:** none` line when there is one. That line is excluded from `body`
 * on purpose: otherwise its presence alone would satisfy "says something".
 */
export function readIssueDoc(corpus, repro) {
  const text = readFileSync(join(corpus, 'issues', `${repro}${DOC_SUFFIX}`), 'utf8');
  const lines = text.split('\n');
  const at = lines.findIndex((line) => line.startsWith(ISSUE_LINE));
  if (at < 0) return null;
  const rest = lines.slice(at + 1);
  const reproAt = rest.findIndex((line) => line.startsWith(REPRO_NONE));
  const body = rest
    .filter((_, i) => i !== reproAt)
    .join('\n')
    .trim();
  return {
    issue: lines[at].slice(ISSUE_LINE.length).trim(),
    body,
    reproNone: reproAt < 0 ? null : rest[reproAt],
  };
}

/** Every backticked path on the `**Repro:** none` line. */
function guardPaths(line) {
  return [...line.matchAll(BACKTICKED)].map((m) => m[1]);
}

/**
 * A doc per repro, both directions, and non-empty. The emptiness check is not
 * decoration: a bijection alone is satisfied by 666 empty files, which is the
 * shape a bulk migration produces when it goes wrong.
 */
function issueDocs(corpus, problems, root) {
  const { repros, docs } = issueEntries(corpus);
  const have = new Set(docs);
  for (const repro of repros) {
    if (!have.has(`${repro}${DOC_SUFFIX}`)) {
      problems.push(`issues/${repro} has no sibling \`${repro}${DOC_SUFFIX}\` describing what it pins`);
      continue;
    }
    const doc = readIssueDoc(corpus, repro);
    if (!doc) problems.push(`issues/${repro}${DOC_SUFFIX} has no \`${ISSUE_LINE.trim()}\` line`);
    else if (!doc.body) problems.push(`issues/${repro}${DOC_SUFFIX} says nothing about what the repro pins`);
    else if (doc.reproNone) {
      problems.push(
        `issues/${repro}${DOC_SUFFIX} says \`${REPRO_NONE}\` while \`${repro}\` is on disk`,
      );
    }
  }
  for (const doc of docs) {
    const repro = doc.slice(0, -DOC_SUFFIX.length);
    if (repros.includes(repro)) continue;
    const parsed = readIssueDoc(corpus, repro);
    if (!parsed) {
      problems.push(`issues/${doc} has no \`${ISSUE_LINE.trim()}\` line`);
      continue;
    }
    if (!parsed.reproNone) {
      problems.push(`issues/${doc} describes \`${repro}\`, which is not on disk`);
      continue;
    }
    if (!parsed.body) problems.push(`issues/${doc} says nothing about what the fix restored`);
    const guards = guardPaths(parsed.reproNone);
    if (guards.length === 0) {
      problems.push(`issues/${doc} says \`${REPRO_NONE}\` but names no guard in backticks`);
      continue;
    }
    for (const guard of guards) {
      if (!existsSync(join(root, guard))) {
        problems.push(`issues/${doc} names the guard \`${guard}\`, which is not on disk`);
      }
    }
  }
}

/** The old README table, generated — `--index`. */
export function index(corpus) {
  const { repros, docs } = issueEntries(corpus);
  const out = ['| File | Issue | What it pins |', '|---|---|---|'];
  for (const repro of repros) {
    const doc = readIssueDoc(corpus, repro);
    if (!doc) continue;
    out.push(`| \`${repro}\` | ${doc.issue} | ${doc.body.replace(/\n/g, ' ')} |`);
  }
  // Records with no repro read the same way and must not be invisible here —
  // being unlisted is the state #4449 was about.
  for (const doc of docs) {
    const repro = doc.slice(0, -DOC_SUFFIX.length);
    if (repros.includes(repro)) continue;
    const parsed = readIssueDoc(corpus, repro);
    if (!parsed?.reproNone) continue;
    const guards = guardPaths(parsed.reproNone).map((g) => `\`${g}\``).join(', ');
    out.push(`| none — guarded by ${guards} | ${parsed.issue} | ${parsed.body.replace(/\n/g, ' ')} |`);
  }
  return out.join('\n');
}

export function check(corpus, sources = SOURCES, root = ROOT) {
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
  issueDocs(corpus, problems, root);

  // Every sibling doc is safe from being collected as a corpus unit only
  // because `pattern` carries `markdown: false` — `collectRepo`'s own default
  // is `true`, so this is a flag and not a structure. Assert it here, in the
  // checker that owns the layout, rather than leaving it to a reviewer: flip it
  // and a doc that quotes its own repro in a ```svelte fence silently becomes a
  // corpus entry.
  const pattern = JSON.parse(readFileSync(sources, 'utf8')).find((s) => s.id === 'pattern');
  if (!pattern) problems.push('corpus-sources.json has no `pattern` entry');
  else if (pattern.markdown !== false) {
    problems.push(
      'corpus-sources.json gives `pattern` markdown != false, so every `issues/<file>.md` ' +
        'would be collected as a corpus unit — the sibling docs depend on that flag',
    );
  }

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
  if (process.argv.includes('--index')) {
    console.log(index(CORPUS));
    return 0;
  }
  const { fatal, problems } = check(CORPUS);
  if (fatal) {
    console.error(`::error::${fatal}`);
    return 2;
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`::error::${problem}`);
    console.error(
      `::error::pattern-corpus documentation drift: ${problems.length} problem(s). ` +
        "Provenance lives beside the repro (`issues/<file>.md`) or in the README — see that file's conventions.",
    );
    return 1;
  }
  console.log('pattern-corpus: every repro, group and theme is documented. ✓');
  return 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  // `process.exit` truncates a piped stdout: writes to a pipe are async, and
  // exiting drops whatever has not drained. `--index` prints ~675 rows, and
  // through a pipe that arrived as the first 162 with no marker — the exact
  // shape of a cap that reads as a complete answer. Setting the code instead
  // lets Node drain first.
  process.exitCode = main();
}
