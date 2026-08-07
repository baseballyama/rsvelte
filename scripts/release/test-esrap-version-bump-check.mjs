#!/usr/bin/env node
// Self-test for scripts/release/check-esrap-version-bump.mjs.
//
// The gate passing on the current tree proves nothing. Each case below pairs a
// change the gate must still demand a version bump for with the near-miss it must
// let through, so a gate that always answered "source changed" — the behaviour
// before the test-only exclusion — fails here.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LIB_PATH,
  SOURCE_PREFIX,
  TEST_ONLY_PREFIXES,
  classifyChangedFiles,
  compareVersions,
  declaresTestOnlyModule,
} from './check-esrap-version-bump.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

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

console.log('check-esrap-version-bump self-test');

// --- The control: the case the gate used to get wrong. ---

check('a diff confined to internal_tests/ demands no version bump', () => {
  const { shippedSource, exclusionLoadBearing } = classifyChangedFiles([
    'crates/rsvelte_esrap/src/internal_tests/golden.rs',
    'crates/rsvelte_esrap/src/internal_tests/mod.rs',
  ]);
  assert(shippedSource.length === 0, `expected no shipped source, got ${shippedSource.join(', ')}`);
  assert(exclusionLoadBearing, 'expected the exclusion to be reported as load-bearing');
});

// --- Discrimination: everything else under src/ still trips the gate. ---

check('a printer.rs change still counts as shipped source', () => {
  const { shippedSource } = classifyChangedFiles(['crates/rsvelte_esrap/src/printer.rs']);
  assert(shippedSource.length === 1, `expected 1 shipped file, got ${shippedSource.length}`);
});

check('lib.rs is not excluded, so dropping the cfg(test) gate trips the check on lib.rs', () => {
  const { shippedSource } = classifyChangedFiles([LIB_PATH]);
  assert(shippedSource.includes(LIB_PATH), 'expected lib.rs to count as shipped source');
});

check('a mixed diff is decided by its shipped half', () => {
  const { shippedSource, exclusionLoadBearing } = classifyChangedFiles([
    'crates/rsvelte_esrap/src/internal_tests/golden.rs',
    'crates/rsvelte_esrap/src/command.rs',
  ]);
  assert(shippedSource.length === 1, `expected 1 shipped file, got ${shippedSource.length}`);
  assert(exclusionLoadBearing, 'expected the exclusion to be reported as load-bearing');
});

check('a sibling file whose name merely starts with the excluded one is not excluded', () => {
  const { shippedSource } = classifyChangedFiles([
    'crates/rsvelte_esrap/src/internal_tests.rs',
    'crates/rsvelte_esrap/src/internal_tests_helper.rs',
  ]);
  assert(shippedSource.length === 2, `expected both to ship, got ${shippedSource.join(', ')}`);
});

check('files outside the crate source are ignored entirely', () => {
  const { changedSource, exclusionLoadBearing } = classifyChangedFiles([
    'crates/rsvelte_core/src/lib.rs',
    'crates/rsvelte_esrap/tests/golden.rs',
    'README.md',
  ]);
  assert(changedSource.length === 0, `expected no crate source, got ${changedSource.join(', ')}`);
  assert(!exclusionLoadBearing, 'the exclusion must not be reported as used here');
});

// --- The exclusion is only sound while lib.rs keeps the directory test-only. ---

check('declaresTestOnlyModule accepts the gated declaration', () => {
  assert(
    declaresTestOnlyModule('mod printer;\n\n#[cfg(test)]\nmod internal_tests;\n'),
    'expected the gated declaration to be recognised',
  );
});

check('declaresTestOnlyModule rejects an ungated declaration', () => {
  assert(
    !declaresTestOnlyModule('mod printer;\n\nmod internal_tests;\n'),
    'an ungated `mod internal_tests;` must not satisfy the invariant',
  );
});

check('declaresTestOnlyModule rejects a gate that applies to another item', () => {
  assert(
    !declaresTestOnlyModule('#[cfg(test)]\nmod helpers;\n\nmod internal_tests;\n'),
    'a cfg(test) on a different module must not satisfy the invariant',
  );
});

// --- The shipped tree. ---

check('the excluded directory exists and is a directory', () => {
  for (const prefix of TEST_ONLY_PREFIXES) {
    const dir = join(repoRoot, prefix);
    assert(existsSync(dir), `${prefix} does not exist — the exclusion names nothing`);
    assert(statSync(dir).isDirectory(), `${prefix} is not a directory`);
    assert(prefix.startsWith(SOURCE_PREFIX), `${prefix} is not under ${SOURCE_PREFIX}`);
    assert(prefix.endsWith('/'), `${prefix} must end in a slash to match a directory only`);
  }
});

check('the shipped lib.rs still declares internal_tests behind #[cfg(test)]', () => {
  assert(
    declaresTestOnlyModule(readFileSync(join(repoRoot, LIB_PATH), 'utf8')),
    `${LIB_PATH} no longer gates internal_tests — the exclusion must be removed`,
  );
});

check('compareVersions orders releases numerically, not lexically', () => {
  assert(compareVersions('0.10.2', '0.9.9') > 0, '0.10.2 must outrank 0.9.9');
  assert(compareVersions('0.10.1', '0.10.1') === 0, 'equal versions must compare equal');
  assert(compareVersions('0.10.1', '0.10.2') < 0, '0.10.1 must rank below 0.10.2');
});

console.log(
  failures === 0
    ? '\ncheck-esrap-version-bump self-test: all checks passed'
    : `\ncheck-esrap-version-bump self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
