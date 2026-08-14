#!/usr/bin/env node
// Self-test for scripts/ci/prereq-coverage-guard.mjs.
//
// The guard passing on the current tree proves nothing — the current tree is what
// it was written against. Every case below is a control: a synthetic repo the
// guard must reject, paired with the near-miss it must accept.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PREREQ_ENV,
  checkCoverage,
  parseWorkflow,
  runSelectsTarget,
  shardExclusions,
  targetForSource,
} from './prereq-coverage-guard.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const LIB = { crate: 'rsvelte_core', kind: 'lib', target: 'rsvelte_core' };
const TEST = { crate: 'rsvelte_fmt', kind: 'test', target: 'cli' };
const EXCLUDED = { crate: 'rsvelte_formatter', kind: 'test', target: 'svelte_dev_corpus' };
const NO_EXCLUSIONS = [];
const EXCLUSIONS = ['svelte_dev_corpus'];

console.log('prereq-coverage-guard self-test');

// --- Target selection ---------------------------------------------------------

check('a `--lib` run does not select an integration-test target', () => {
  assert(!runSelectsTarget('cargo nextest run --profile ci --lib', TEST, NO_EXCLUSIONS), 'expected not selected');
});

check('`--test <name>` selects that binary and not the lib', () => {
  assert(runSelectsTarget('cargo nextest run -p rsvelte_fmt --test cli', TEST, NO_EXCLUSIONS), 'expected selected');
  assert(!runSelectsTarget('cargo nextest run -p rsvelte_fmt --test cli', LIB, NO_EXCLUSIONS), 'expected not selected');
});

check('a trailing test-name filter is not credited with covering the target', () => {
  assert(
    !runSelectsTarget('cargo nextest run --profile ci -p rsvelte_fmt --test cli sort_tailwindcss', TEST, NO_EXCLUSIONS),
    'a name-filtered run covers a subset, so it must not count',
  );
});

check('a nextest `-E` expression is not credited either', () => {
  assert(
    !runSelectsTarget("cargo nextest run --profile ci --lib -E 'not test(/slow/)'", LIB, NO_EXCLUSIONS),
    'a filter-expression run covers a subset, so it must not count',
  );
});

check('the shard script covers every non-excluded integration target', () => {
  const run = 'bash scripts/ci/run-test-shard.sh 1 3';
  assert(runSelectsTarget(run, TEST, EXCLUSIONS), 'expected the shard to cover a non-excluded target');
  assert(!runSelectsTarget(run, EXCLUDED, EXCLUSIONS), 'an excluded target must not be credited to the shard');
  assert(!runSelectsTarget(run, { crate: 'rsvelte_core', kind: 'lib', target: 'rsvelte_core' }, EXCLUSIONS), 'the shard runs no lib targets');
});

check('a folded (`>-`) run is one command, not one per line', () => {
  // The continuation lines of a folded scalar begin with `-p`; joined by newline
  // the first line reads as a bare `cargo nextest run` that selects everything.
  const workflow = parseWorkflow(
    [
      'on: push',
      'jobs:',
      '  fmt:',
      '    name: Test fmt corpus',
      '    steps:',
      '      - name: run',
      '        run: >-',
      '          cargo nextest run --profile ci',
      '          -p rsvelte_fmt --test cli',
      '        env:',
      `          ${PREREQ_ENV}: '1'`,
      '',
    ].join('\n'),
  );
  const step = workflow.jobs[0].steps[0];
  assert(runSelectsTarget(step.run, TEST, NO_EXCLUSIONS), 'expected the named test target to be selected');
  assert(!runSelectsTarget(step.run, { crate: 'rsvelte_core', kind: 'lib', target: 'rsvelte_core' }, NO_EXCLUSIONS), 'a folded run must not be credited with the lib target');
});

// --- Source-to-target mapping -------------------------------------------------

check('sources map to the cargo target that carries them', () => {
  const cliMod = targetForSource('crates/rsvelte_fmt/tests/cli/daemon.rs');
  assert(cliMod.kind === 'test' && cliMod.target === 'cli', `expected test:cli, got ${cliMod.kind}:${cliMod.target}`);
  const embed = targetForSource('crates/rsvelte_fmt/tests/embed.rs');
  assert(embed.target === 'embed', `expected test:embed, got ${embed.target}`);
});

check('a path outside crates/ is an error, not a silent skip', () => {
  let threw = false;
  try {
    targetForSource('scripts/ci/whatever.rs');
  } catch {
    threw = true;
  }
  assert(threw, 'expected targetForSource to throw');
});

// --- Parser fails closed ------------------------------------------------------

check('a workflow with no `jobs:` block throws rather than reporting no runs', () => {
  let threw = false;
  try {
    parseWorkflow('on: push\nname: broken\n');
  } catch {
    threw = true;
  }
  assert(threw, 'expected parseWorkflow to throw');
});

check('env is picked up at step, job and workflow scope', () => {
  const text = (where) =>
    [
      'on: push',
      ...(where === 'workflow' ? ['env:', `  ${PREREQ_ENV}: '1'`] : []),
      'jobs:',
      '  unit:',
      '    name: Test unit',
      ...(where === 'job' ? ['    env:', `      ${PREREQ_ENV}: '1'`] : []),
      '    steps:',
      '      - name: run',
      '        run: cargo nextest run --profile ci --lib',
      ...(where === 'step' ? ['        env:', `          ${PREREQ_ENV}: '1'`] : []),
      '',
    ].join('\n');
  for (const where of ['workflow', 'job', 'step']) {
    const workflow = parseWorkflow(text(where));
    const job = workflow.jobs[0];
    const declares =
      workflow.env.has(PREREQ_ENV) || job.env.has(PREREQ_ENV) || job.steps[0].env.has(PREREQ_ENV);
    assert(declares, `${where}-scoped env was not seen`);
  }
});

check("a sibling step's env does not leak onto the run step", () => {
  const workflow = parseWorkflow(
    [
      'on: push',
      'jobs:',
      '  unit:',
      '    steps:',
      '      - name: setup',
      '        run: echo hi',
      '        env:',
      `          ${PREREQ_ENV}: '1'`,
      '      - name: run',
      '        run: cargo nextest run --profile ci --lib',
      '',
    ].join('\n'),
  );
  const [setup, run] = workflow.jobs[0].steps;
  assert(setup.env.has(PREREQ_ENV), 'expected the setup step to carry the env');
  assert(!run.env.has(PREREQ_ENV), 'the env must not leak to the next step');
});

// --- End to end, on a synthetic repo ------------------------------------------

function withRepo(declaresEnv, fn) {
  const root = mkdtempSync(join(tmpdir(), 'prereq-coverage-'));
  try {
    mkdirSync(join(root, 'crates', 'demo', 'src'), { recursive: true });
    mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
    mkdirSync(join(root, 'scripts', 'ci'), { recursive: true });
    writeFileSync(
      join(root, 'crates', 'demo', 'src', 'lib.rs'),
      `fn skip() { std::env::var_os("${PREREQ_ENV}"); }\n`,
    );
    writeFileSync(
      join(root, 'scripts', 'ci', 'run-test-shard.sh'),
      'awk -F\'\\t\' \'$2 != "excluded_target"\'\n',
    );
    writeFileSync(
      join(root, '.github', 'workflows', 'ci.yml'),
      [
        'on: push',
        'jobs:',
        '  unit:',
        '    name: Test unit',
        '    steps:',
        '      - name: Run workspace unit tests',
        '        run: cargo nextest run --profile ci --lib',
        ...(declaresEnv ? ['        env:', `          ${PREREQ_ENV}: '1'`] : []),
        '',
      ].join('\n'),
    );
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

check('the control: the only job running the guarded target drops the env and the guard fails', () => {
  withRepo(false, (root) => {
    const { violations } = checkCoverage(root);
    assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
    assert(
      violations[0].message.includes('none set'),
      `expected a "runs it but does not declare" message, got: ${violations[0].message}`,
    );
    assert(
      violations[0].target.sources[0].endsWith('crates/demo/src/lib.rs'),
      'the violation must name the guarded source',
    );
  });
});

check('the same repo with the env restored is clean', () => {
  withRepo(true, (root) => {
    const { violations, covered } = checkCoverage(root);
    assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
    assert(covered.length === 1, `expected 1 covered target, got ${covered.length}`);
  });
});

// --- The shipped tree ---------------------------------------------------------

check('the shard script still declares its exclusion list in a readable form', () => {
  const names = shardExclusions(REPO_ROOT);
  assert(names.length > 0, 'expected at least one excluded target');
  assert(
    names.includes('svelte_dev_corpus'),
    `expected the fmt-corpus binaries to be excluded, got ${names.join(', ')}`,
  );
});

check('every guarded target in the shipped tree is enforced by some job', () => {
  const { violations, targets } = checkCoverage(REPO_ROOT);
  assert(targets.length > 0, 'expected to discover guarded targets');
  assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations, null, 2)}`);
});

console.log(
  failures === 0
    ? '\nprereq-coverage-guard self-test: all checks passed'
    : `\nprereq-coverage-guard self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
