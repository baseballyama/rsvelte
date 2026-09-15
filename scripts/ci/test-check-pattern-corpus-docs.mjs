#!/usr/bin/env node
// Controls for check-pattern-corpus-docs.mjs. A documentation guard that passes
// on the tree it was written against proves nothing, so every case below builds
// a synthetic pattern-corpus and pins one direction of the bijection.
//
// The discriminating case is `a row under the wrong group does not document the
// file`: the README carries several tables whose leading cell is a filename, so
// a whole-file scan — which is what the first draft of the guard did — passes
// that case while the section-scoped check fails it.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { check, index } from './check-pattern-corpus-docs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

/**
 * Build a corpus on disk. `readme` is assembled from the three sections so a
 * case only has to state the rows it wants, and a case that states none still
 * produces a structurally valid README.
 */
function corpus({ issues = {}, orphanDocs = {}, matrix = {}, adversarial = {}, readme, sources }) {
  const dir = mkdtempSync(join(tmpdir(), 'pattern-corpus-'));
  for (const name of ['issues', 'matrix', 'adversarial']) mkdirSync(join(dir, name));
  for (const [file, spec] of Object.entries(issues)) {
    writeFileSync(join(dir, 'issues', file), '<p>x</p>\n');
    // `spec === null` is the ordinary case: a well-formed sibling doc. A string
    // is written verbatim, so a case can state a malformed one; `false` writes
    // no doc at all.
    if (spec === false) continue;
    writeFileSync(
      join(dir, 'issues', `${file}.md`),
      typeof spec === 'string' ? spec : `# \`${file}\`\n\n**Issue:** [#1](x)\n\nwhy\n`,
    );
  }
  for (const [file, spec] of Object.entries(orphanDocs)) {
    writeFileSync(join(dir, 'issues', file), spec);
  }
  for (const [group, files] of Object.entries(matrix)) {
    mkdirSync(join(dir, 'matrix', group));
    for (const file of files) writeFileSync(join(dir, 'matrix', group, file), '<p>x</p>\n');
  }
  for (const [theme, files] of Object.entries(adversarial)) {
    mkdirSync(join(dir, 'adversarial', theme));
    for (const file of files) writeFileSync(join(dir, 'adversarial', theme, file), '<p>x</p>\n');
  }
  writeFileSync(join(dir, 'README.md'), readme);
  writeFileSync(
    join(dir, 'corpus-sources.json'),
    JSON.stringify(sources ?? [{ path: 'compatibility/pattern-corpus', id: 'pattern', markdown: false }]),
  );
  return dir;
}

function table(rows) {
  return ['| a | b |', '|---|---|', ...rows.map((r) => `| \`${r}\` | why |`)].join('\n');
}

function readme({ groups = {}, themeRows = [] }) {
  const matrixSections = Object.entries(groups)
    .map(([group, rows]) => `### \`${group}/\` — axis\n\n${table(rows)}\n`)
    .join('\n');
  return [
    '# pattern-corpus',
    '',
    '## `issues/` — one repro per divergence',
    '',
    'Documented by a sibling `issues/<file>.md`, not by a table here.',
    '',
    '## `matrix/` — the axes',
    '',
    matrixSections,
    '## `adversarial/` — sweep',
    '',
    table(themeRows),
    '',
    '## Adding a file',
    '',
    'prose',
    '',
  ].join('\n');
}

/** The corpus every case starts from: fully documented, nothing to report. */
function clean(overrides = {}) {
  const shape = {
    issues: { 'a.svelte': null },
    matrix: { grp: ['m.svelte'] },
    adversarial: { theme: ['t.svelte'] },
    ...overrides,
  };
  delete shape.readme;
  return corpus({
    ...shape,
    readme: overrides.readme ?? readme({ groups: { grp: ['m.svelte'] }, themeRows: ['theme/'] }),
  });
}

function run(dir, root = ROOT) {
  try {
    return check(dir, join(dir, 'corpus-sources.json'), root);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A guard path is resolved against the repo root, so the present/absent pair is
// drawn from the real tree. The present one is this guard's own script: it
// cannot disappear without taking these controls with it.
const GUARD = 'scripts/ci/check-pattern-corpus-docs.mjs';
const MISSING_GUARD = 'crates/rsvelte_core/tests/no-such-guard-4449.rs';
const recordDoc = (guard = GUARD, body = 'what the fix restored') =>
  `# \`ghost.svelte\`\n\n**Issue:** [#1](x)\n**Repro:** none — \`${guard}\`\n\n${body}\n`;

const tests = {
  'a fully documented corpus reports nothing'() {
    const { fatal, problems } = run(clean());
    assert.equal(fatal, null);
    assert.deepEqual(problems, []);
  },

  'an issues/ file with no sibling doc is reported'() {
    const { problems } = run(clean({ issues: { 'a.svelte': null, 'orphan.svelte': false } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /issues\/orphan\.svelte has no sibling/);
  },

  'a sibling doc with no file is reported'() {
    const { problems } = run(clean({ orphanDocs: { 'ghost.svelte.md': '**Issue:** x\n\nwhy\n' } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /issues\/ghost\.svelte\.md describes `ghost\.svelte`, which is not on disk/);
  },

  // #4449: a fix whose divergence cannot be written as a repro — a comment-only
  // divergence is byte-different, AST-equivalent, and scored a pass by every
  // corpus target — had nowhere to be recorded, and the absence was silent. A
  // doc with no file is now legal, but only when it names a guard that exists.
  'a doc with no file that names an existing guard is accepted'() {
    const { fatal, problems } = run(clean({ orphanDocs: { 'ghost.svelte.md': recordDoc() } }));
    assert.equal(fatal, null);
    assert.deepEqual(problems, []);
  },

  'a doc with no file that names a missing guard is reported'() {
    const { problems } = run(clean({ orphanDocs: { 'ghost.svelte.md': recordDoc(MISSING_GUARD) } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /names the guard `[^`]*no-such-guard-4449\.rs`, which is not on disk/);
  },

  'a doc with no file whose guard line names nothing is reported'() {
    const { problems } = run(
      clean({
        orphanDocs: {
          'ghost.svelte.md': '# x\n\n**Issue:** [#1](x)\n**Repro:** none, a unit test covers it\n\nwhy\n',
        },
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /names no guard in backticks/);
  },

  'a doc with no file that says nothing is reported'() {
    const { problems } = run(
      clean({ orphanDocs: { 'ghost.svelte.md': recordDoc(GUARD, '') } }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /says nothing about what the fix restored/);
  },

  // The relaxation is one-directional: a file on disk still owes a repro, so a
  // doc cannot claim there is none while its own repro sits beside it.
  'a doc that claims no repro while its file is on disk is reported'() {
    const { problems } = run(
      clean({
        issues: {
          'a.svelte': `# \`a.svelte\`\n\n**Issue:** [#1](x)\n**Repro:** none — \`${GUARD}\`\n\nwhy\n`,
        },
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /says `\*\*Repro:\*\* none` while `a\.svelte` is on disk/);
  },

  // A bijection alone is satisfied by 666 empty files, which is what a bulk
  // migration produces when it goes wrong. These two pin that it is not.
  'a sibling doc with no Issue line is reported'() {
    const { problems } = run(clean({ issues: { 'a.svelte': '# `a.svelte`\n\nprose only\n' } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /has no `\*\*Issue:\*\*` line/);
  },

  'a sibling doc that says nothing is reported'() {
    const { problems } = run(clean({ issues: { 'a.svelte': '# `a.svelte`\n\n**Issue:** [#1](x)\n\n' } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /says nothing about what the repro pins/);
  },

  // Every sibling doc is safe from collection only because `pattern` carries
  // `markdown: false`, and `collectRepo`'s own default is `true`. The guard has
  // to fail when someone flips the flag, not when someone later writes a fence.
  'markdown: true on the pattern source is reported'() {
    const { problems } = run(
      clean({ sources: [{ path: 'compatibility/pattern-corpus', id: 'pattern', markdown: true }] }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /markdown != false/);
  },

  'a missing pattern source entry is reported'() {
    const { problems } = run(clean({ sources: [{ path: 'x', id: 'other', markdown: false }] }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /no `pattern` entry/);
  },

  // The whole reason the check is section-scoped rather than whole-file.
  'a row under the wrong group does not document the file'() {
    const { problems } = run(
      clean({
        matrix: { one: ['x.svelte'], two: ['y.svelte'] },
        readme: readme({
          // `y.svelte` is listed, but under `one/`.
          groups: { one: ['x.svelte', 'y.svelte'], two: [] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.equal(problems.length, 2, problems.join('; '));
    assert.ok(
      problems.some((p) => /matrix\/two\/y\.svelte has no row/.test(p)),
      problems.join('; '),
    );
    assert.ok(
      problems.some((p) => /`y\.svelte`.*matrix\/one\/.*names nothing on disk/.test(p)),
      problems.join('; '),
    );
  },

  // The near-miss the previous case must not be confused with: the same two
  // files, each under its own section, is correct and must stay accepted.
  'the same files under their own sections are accepted'() {
    const { problems } = run(
      clean({
        matrix: { one: ['x.svelte'], two: ['y.svelte'] },
        readme: readme({
          groups: { one: ['x.svelte'], two: ['y.svelte'] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.deepEqual(problems, []);
  },

  // An `issues/` name is not documented by a row that happens to sit in the
  // matrix section — the other half of the scoping.
  'a matrix row does not document an issues/ file'() {
    const { problems } = run(
      clean({
        issues: { 'a.svelte': null, 'shared.svelte': false },
        matrix: { grp: ['m.svelte', 'shared.svelte'] },
        readme: readme({
          groups: { grp: ['m.svelte', 'shared.svelte'] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /issues\/shared\.svelte has no sibling/);
  },

  'a matrix group with no section is reported'() {
    const { problems } = run(
      clean({
        matrix: { grp: ['m.svelte'], undocumented: ['n.svelte'] },
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /matrix\/undocumented\/ has no .*section/);
  },

  'a documented group with no directory is reported'() {
    const { problems } = run(
      clean({
        readme: readme({
          groups: { grp: ['m.svelte'], vanished: [] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /documents matrix\/vanished\/, which is not on disk/);
  },

  'an adversarial theme with no row is reported'() {
    const { problems } = run(
      clean({ adversarial: { theme: ['t.svelte'], quiet: ['q.svelte'] } }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /adversarial\/quiet\/ has no row/);
  },

  'a themes row with no directory is reported'() {
    const { problems } = run(
      clean({
        readme: readme({
          groups: { grp: ['m.svelte'] },
          themeRows: ['theme/', 'gone/'],
        }),
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /`gone\/`.*no directory/);
  },

  // A sub-corpus nobody taught the guard about must fail, not pass quietly.
  'an unknown sub-corpus is fatal'() {
    const dir = clean();
    mkdirSync(join(dir, 'fourth'));
    const { fatal } = run(dir);
    assert.match(fatal ?? '', /sub-corpora this check does not know about: fourth/);
  },

  // `--index` is advertised in the corpus README as the way to read the docs in
  // one place, so a broken generator is a documentation defect of its own.
  '--index reproduces one row per repro, from the docs'() {
    const dir = clean({ issues: { 'a.svelte': null, 'b.svelte': null } });
    try {
      const rows = index(dir).split('\n').filter((line) => /^\| `/.test(line));
      assert.equal(rows.length, 2, rows.join('; '));
      assert.equal(rows[0], '| `a.svelte` | [#1](x) | why |');
      assert.equal(rows[1], '| `b.svelte` | [#1](x) | why |');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },

  // `--index` is the "read them all in one place" command the README points at,
  // and through a PIPE `process.exit` dropped everything that had not drained:
  // 162 of 675 rows, deterministically, with no marker. Compared against the
  // in-process value rather than against a literal, so it cannot go stale.
  '--index survives a pipe'() {
    const inProcess = index(join(ROOT, 'compatibility', 'pattern-corpus'));
    const piped = execFileSync(
      process.execPath,
      [join(ROOT, 'scripts/ci/check-pattern-corpus-docs.mjs'), '--index'],
      { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'inherit'] },
    );
    assert.equal(piped.trimEnd(), inProcess.trimEnd());
  },

  // A guard nothing calls is worth nothing.
  'ci.yml runs the guard and its controls'() {
    const workflow = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
    assert.match(workflow, /node scripts\/ci\/check-pattern-corpus-docs\.mjs/);
    assert.match(workflow, /node scripts\/ci\/test-check-pattern-corpus-docs\.mjs/);
  },
};

let failed = 0;
for (const [name, test] of Object.entries(tests)) {
  try {
    test();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}\n     ${error.message}`);
  }
}
console.log(`\n${Object.keys(tests).length - failed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
