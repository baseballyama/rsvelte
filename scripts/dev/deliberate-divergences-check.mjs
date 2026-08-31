#!/usr/bin/env node
// DoD for `compatibility/GATES.md#deliberate-divergences`: a divergence recorded there is a
// decision not to close, so it must be held in place by a test. A section with prose
// and no pin is a claim nothing re-checks — the next refactor changes the behaviour
// and the document keeps asserting the old one.
//
// One section is one `## ` heading. A pin is a repository path this file names that
// exists on disk and is a test: something under a `tests/` directory, a corpus pattern,
// or a `scripts/**/test-*.mjs` harness — the checker's first run rejected a section that
// WAS pinned, by a harness under `scripts/dev/`, so the shape has to be read off the
// tree rather than assumed.
import fs from 'node:fs';
import path from 'node:path';

// The doc is consolidated into `GATES.md` at the end of the campaign, where it
// becomes one anchored section and every heading is demoted a level. Resolving
// both shapes here keeps this a machine-facing read rather than a link to patch.
const ANCHOR = 'deliberate-divergences';
function locate() {
  const own = `compatibility/${ANCHOR}.md`;
  if (fs.existsSync(own)) {
    return { doc: own, text: fs.readFileSync(own, 'utf8'), heading: /^## /, cut: 3, offset: 0 };
  }
  const merged = 'compatibility/GATES.md';
  const all = fs.readFileSync(merged, 'utf8').split('\n');
  const start = all.findIndex((l) => l.trim() === `<a id="${ANCHOR}"></a>`);
  if (start === -1) {
    console.error(`[deliberate-divergences-check] neither ${own} nor a \`${ANCHOR}\` anchor in ${merged}`);
    process.exit(1);
  }
  let end = all.length;
  for (let i = start + 1; i < all.length; i++) {
    if (/^<a id="[^"]+"><\/a>$/.test(all[i].trim())) { end = i; break; }
  }
  return {
    doc: merged,
    text: all.slice(start, end).join('\n'),
    heading: /^### /,
    cut: 4,
    offset: start,
  };
}
const { doc: DOC, text, heading: HEADING, cut: CUT, offset: OFFSET } = locate();

const PIN = /`((?:crates|compatibility|apps|packages|scripts)\/[A-Za-z0-9._@/-]+?\.(?:rs|svelte|svelte\.js|svelte\.ts|mjs|ts))`/g;
const isPin = (p) =>
  /(^|\/)tests\//.test(p) ||
  p.startsWith('compatibility/pattern-corpus/') ||
  /(^|\/)test-[A-Za-z0-9._-]+\.mjs$/.test(p) ||
  // `node --test scripts/compat-lsp/*.test.mjs` is how those harnesses run, so
  // renaming one to `test-*.mjs` to satisfy this predicate would drop it from CI.
  /\.test\.mjs$/.test(p);

const lines = text.split('\n');
const sections = [];
let current = null;
let inFence = false;
for (const [i, line] of lines.entries()) {
  if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
  if (inFence) {
    if (current) current.body.push(line);
    continue;
  }
  if (HEADING.test(line)) {
    current = { title: line.slice(CUT).trim(), line: OFFSET + i + 1, body: [] };
    sections.push(current);
  } else if (current) {
    current.body.push(line);
  }
}

const problems = [];
for (const s of sections) {
  const body = s.body.join('\n');
  const cited = [...body.matchAll(PIN)].map((m) => m[1]);
  const pins = cited.filter(isPin);
  if (pins.length === 0) {
    problems.push(`${DOC}:${s.line}  "${s.title}" names no pin`);
    continue;
  }
  for (const p of pins) {
    if (!fs.existsSync(path.resolve(p))) {
      problems.push(`${DOC}:${s.line}  "${s.title}" cites a pin that does not exist: ${p}`);
    }
  }
}

if (sections.length === 0) {
  console.error(`[deliberate-divergences-check] no sections found in ${DOC} — the parser or the doc changed`);
  process.exit(1);
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(
    `\n[deliberate-divergences-check] ${problems.length} problem(s) across ${sections.length} recorded divergence(s).\n` +
      'Every recorded divergence needs a test that fails if the behaviour changes; cite it as a\n' +
      'backticked repository path under a `tests/` directory, in `compatibility/pattern-corpus/`,\n' +
      'or a `test-*.mjs` / `*.test.mjs` harness under `scripts/`.',
  );
  process.exit(1);
}

console.log(
  `[deliberate-divergences-check] ${sections.length} recorded divergence(s), each pinned by an existing test.`,
);
