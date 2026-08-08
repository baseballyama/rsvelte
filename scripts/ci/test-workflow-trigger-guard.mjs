#!/usr/bin/env node
// Self-test for scripts/ci/workflow-trigger-guard.mjs.
//
// The guard passing on the current tree proves nothing: the current tree is the
// state it was written against. Every case below is a *control* — a synthetic
// workflow directory the guard must reject, paired with the near-miss it must
// accept, so a guard that simply returned "clean" would fail here.

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALLOWLIST, analyzeWorkflow, checkWorkflows } from './workflow-trigger-guard.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REAL_WORKFLOW_DIR = join(HERE, '..', '..', '.github', 'workflows');

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

/** Build a throwaway workflow dir; returns its path. */
function makeDir(files) {
	const dir = mkdtempSync(join(tmpdir(), 'workflow-trigger-guard-'));
	for (const [name, body] of Object.entries(files)) {
		writeFileSync(join(dir, name), body);
	}
	return dir;
}

function withDir(files, fn) {
	const dir = makeDir(files);
	try {
		return fn(dir);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

const JOBS = `
jobs:
  noop:
    runs-on: ubuntu-latest
    steps:
      - run: echo hi
`;

const FILTERED = `name: filtered\n\non:\n  pull_request:\n    branches: [main]\n${JOBS}`;
const UNFILTERED = `name: unfiltered\n\non:\n  pull_request:\n${JOBS}`;

console.log('workflow-trigger-guard self-test');

// --- The control: an unallowlisted base-branch filter must fail, by name. ---

check('flags an unallowlisted `pull_request: branches:` filter, naming the file', () => {
	withDir({ 'offender.yml': FILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(
			violations[0].file === 'offender.yml',
			`violation must name the file, got ${violations[0].file}`,
		);
	});
});

check('an allowlisted filter is accepted', () => {
	withDir({ 'offender.yml': FILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, { 'offender.yml': 'measures against a main baseline' });
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- Discrimination: the guard must not fire on everything. ---

check('a `branches:` filter under `push:` alone is not a violation', () => {
	const body = `name: push only\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    paths:\n      - 'src/**'\n${JOBS}`;
	withDir({ 'pushonly.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a bare `pull_request:` with no nested keys is not a violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- Shapes that a naive "next line after pull_request" scan would miss. ---

check('block-sequence `branches:` listed after `types:`/`paths:` is caught', () => {
	const body = `name: late\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    types: [opened, synchronize]\n    paths:\n      - 'src/**'\n    branches:\n      - main\n      - 'release/**'\n${JOBS}`;
	withDir({ 'late.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('`branches-ignore:` is caught on the same axis', () => {
	const body = `name: ignore\n\non:\n  pull_request:\n    branches-ignore: ['legacy/**']\n${JOBS}`;
	withDir({ 'ignore.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('`pull_request_target:` is caught too', () => {
	const body = `name: target\n\non:\n  pull_request_target:\n    branches: [main]\n${JOBS}`;
	withDir({ 'target.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('a commented-out `branches:` does not count', () => {
	const body = `name: commented\n\non:\n  pull_request:\n    # branches: [main]\n    types: [opened]\n${JOBS}`;
	withDir({ 'commented.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a `branches:` key nested deeper than the trigger does not count', () => {
	const body = `name: deep\n\non:\n  pull_request:\n    types: [opened]\n${JOBS}    env:\n      branches: nope\n`;
	withDir({ 'deep.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- The record must not outlive what it records. ---

check('an allowlist entry for an unfiltered workflow is a stale-entry violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, { 'bare.yml': 'reason' });
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(/stale/i.test(violations[0].message), `expected a stale-entry message`);
	});
});

check('an allowlist entry for a missing workflow is a stale-entry violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, { 'gone.yml': 'reason' });
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(violations[0].file === 'gone.yml', `expected the missing file to be named`);
	});
});

// --- Unparseable input fails closed, never "no filter found". ---

check('a workflow with no `on:` block throws rather than reporting clean', () => {
	let threw = false;
	try {
		analyzeWorkflow('name: broken\njobs:\n  noop:\n    runs-on: ubuntu-latest\n');
	} catch {
		threw = true;
	}
	assert(threw, 'expected analyzeWorkflow to throw on a missing `on:` block');
});

check('an empty workflow directory throws rather than reporting clean', () => {
	let threw = false;
	withDir({}, (dir) => {
		try {
			checkWorkflows(dir, {});
		} catch {
			threw = true;
		}
	});
	assert(threw, 'expected checkWorkflows to throw on an empty directory');
});

check('inline `on: [push, pull_request]` parses without crashing', () => {
	const { triggers } = analyzeWorkflow(`name: inline\non: [push, pull_request]\n${JOBS}`);
	assert(triggers.length === 0, `expected no nested triggers, got ${JSON.stringify(triggers)}`);
});

// --- Concurrency: a cancelling group that cannot distinguish two pushes. ---

const PUSH_ON = `
on:
  push:
    branches: [main]
`;

check('a ref-keyed cancelling group on a push workflow is rejected', () => {
	withDir(
		{
			'a.yml': `name: a${PUSH_ON}\nconcurrency:\n  group: a-\${{ github.ref }}\n  cancel-in-progress: true\n${JOBS}`,
		},
		(dir) => {
			const { violations } = checkWorkflows(dir, {});
			assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
			assert(/carries no verdict/.test(violations[0].message), 'expected the verdict wording');
		},
	);
});

check('the same group keyed by github.sha is accepted', () => {
	withDir(
		{
			'a.yml': `name: a${PUSH_ON}\nconcurrency:\n  group: a-\${{ github.head_ref || github.sha }}\n  cancel-in-progress: true\n${JOBS}`,
		},
		(dir) => {
			const { violations } = checkWorkflows(dir, {});
			assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
		},
	);
});

check('cancel-in-progress: false makes the group key irrelevant', () => {
	withDir(
		{
			'a.yml': `name: a${PUSH_ON}\nconcurrency:\n  group: a-\${{ github.ref }}\n  cancel-in-progress: false\n${JOBS}`,
		},
		(dir) => {
			const { violations } = checkWorkflows(dir, {});
			assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
		},
	);
});

check('a ref-keyed cancelling group without a push trigger is accepted', () => {
	withDir(
		{
			'a.yml': `name: a\non:\n  pull_request:\nconcurrency:\n  group: a-\${{ github.ref }}\n  cancel-in-progress: true\n${JOBS}`,
		},
		(dir) => {
			const { violations } = checkWorkflows(dir, {});
			assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
		},
	);
});

check('a job-level concurrency block is not read as the workflow-level one', () => {
	const source = `name: a${PUSH_ON}\njobs:\n  publish:\n    runs-on: ubuntu-latest\n    concurrency:\n      group: a-\${{ github.ref }}\n      cancel-in-progress: true\n    steps:\n      - run: echo hi\n`;
	const { concurrency } = analyzeWorkflow(source);
	assert(concurrency === null, `expected no top-level concurrency, got ${JSON.stringify(concurrency)}`);
	withDir({ 'a.yml': source }, (dir) => {
		const { violations } = checkWorkflows(dir, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- The shipped tree. ---

check('the real .github/workflows tree is clean under the shipped allowlist', () => {
	const { violations, checked } = checkWorkflows(REAL_WORKFLOW_DIR);
	assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations, null, 2)}`);
	assert(checked > 0, 'expected to check at least one workflow');
});

check('every shipped allowlist entry carries a non-empty reason', () => {
	for (const [file, reason] of Object.entries(ALLOWLIST)) {
		assert(typeof reason === 'string' && reason.trim().length > 20, `${file}: reason too thin`);
	}
});

console.log(
	failures === 0
		? '\nworkflow-trigger-guard self-test: all checks passed'
		: `\nworkflow-trigger-guard self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
