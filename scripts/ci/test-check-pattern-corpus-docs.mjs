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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { check } from './check-pattern-corpus-docs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

/**
 * Build a corpus on disk. `readme` is assembled from the three sections so a
 * case only has to state the rows it wants, and a case that states none still
 * produces a structurally valid README.
 */
function corpus({ issues = {}, matrix = {}, adversarial = {}, readme }) {
  const dir = mkdtempSync(join(tmpdir(), 'pattern-corpus-'));
  for (const name of ['issues', 'matrix', 'adversarial']) mkdirSync(join(dir, name));
  for (const [file, body] of Object.entries(issues)) {
    writeFileSync(join(dir, 'issues', file), body ?? '<p>x</p>\n');
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
  return dir;
}

function table(rows) {
  return ['| a | b |', '|---|---|', ...rows.map((r) => `| \`${r}\` | why |`)].join('\n');
}

function readme({ issueRows = [], groups = {}, themeRows = [] }) {
  const matrixSections = Object.entries(groups)
    .map(([group, rows]) => `### \`${group}/\` — axis\n\n${table(rows)}\n`)
    .join('\n');
  return [
    '# pattern-corpus',
    '',
    '## `issues/` — one repro per divergence',
    '',
    table(issueRows),
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
  return corpus({
    ...shape,
    readme:
      overrides.readme ??
      readme({ issueRows: ['a.svelte'], groups: { grp: ['m.svelte'] }, themeRows: ['theme/'] }),
  });
}

function run(dir) {
  try {
    return check(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const tests = {
  'a fully documented corpus reports nothing'() {
    const { fatal, problems } = run(clean());
    assert.equal(fatal, null);
    assert.deepEqual(problems, []);
  },

  'an issues/ file with no row is reported'() {
    const { problems } = run(clean({ issues: { 'a.svelte': null, 'orphan.svelte': null } }));
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /issues\/orphan\.svelte has no row/);
  },

  'an issues/ row with no file is reported'() {
    const { problems } = run(
      clean({
        readme: readme({
          issueRows: ['a.svelte', 'ghost.svelte'],
          groups: { grp: ['m.svelte'] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /`ghost\.svelte`.*names nothing on disk/);
  },

  // The whole reason the check is section-scoped rather than whole-file.
  'a row under the wrong group does not document the file'() {
    const { problems } = run(
      clean({
        matrix: { one: ['x.svelte'], two: ['y.svelte'] },
        readme: readme({
          issueRows: ['a.svelte'],
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
          issueRows: ['a.svelte'],
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
        issues: { 'a.svelte': null, 'shared.svelte': null },
        matrix: { grp: ['m.svelte', 'shared.svelte'] },
        readme: readme({
          issueRows: ['a.svelte'],
          groups: { grp: ['m.svelte', 'shared.svelte'] },
          themeRows: ['theme/'],
        }),
      }),
    );
    assert.equal(problems.length, 1, problems.join('; '));
    assert.match(problems[0], /issues\/shared\.svelte has no row/);
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
          issueRows: ['a.svelte'],
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
          issueRows: ['a.svelte'],
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
