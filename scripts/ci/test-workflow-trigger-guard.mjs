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

import {
	ALLOWLIST,
	JOB_CONCURRENCY_ALLOWLIST,
	analyzeWorkflow,
	checkWorkflows,
} from './workflow-trigger-guard.mjs';

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
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(
			violations[0].file === 'offender.yml',
			`violation must name the file, got ${violations[0].file}`,
		);
	});
});

check('an allowlisted filter is accepted', () => {
	withDir({ 'offender.yml': FILTERED }, (dir) => {
		const { violations } = checkWorkflows(
			dir,
			{ 'offender.yml': 'measures against a main baseline' },
			{},
		);
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- Discrimination: the guard must not fire on everything. ---

check('a `branches:` filter under `push:` alone is not a violation', () => {
	const body = `name: push only\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    paths:\n      - 'src/**'\n${JOBS}`;
	withDir({ 'pushonly.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a bare `pull_request:` with no nested keys is not a violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- Shapes that a naive "next line after pull_request" scan would miss. ---

check('block-sequence `branches:` listed after `types:`/`paths:` is caught', () => {
	const body = `name: late\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    types: [opened, synchronize]\n    paths:\n      - 'src/**'\n    branches:\n      - main\n      - 'release/**'\n${JOBS}`;
	withDir({ 'late.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('`branches-ignore:` is caught on the same axis', () => {
	const body = `name: ignore\n\non:\n  pull_request:\n    branches-ignore: ['legacy/**']\n${JOBS}`;
	withDir({ 'ignore.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('`pull_request_target:` is caught too', () => {
	const body = `name: target\n\non:\n  pull_request_target:\n    branches: [main]\n${JOBS}`;
	withDir({ 'target.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
	});
});

check('a commented-out `branches:` does not count', () => {
	const body = `name: commented\n\non:\n  pull_request:\n    # branches: [main]\n    types: [opened]\n${JOBS}`;
	withDir({ 'commented.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a `branches:` key nested deeper than the trigger does not count', () => {
	const body = `name: deep\n\non:\n  pull_request:\n    types: [opened]\n${JOBS}    env:\n      branches: nope\n`;
	withDir({ 'deep.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

// --- The record must not outlive what it records. ---

check('an allowlist entry for an unfiltered workflow is a stale-entry violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, { 'bare.yml': 'reason' }, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(/stale/i.test(violations[0].message), `expected a stale-entry message`);
	});
});

check('an allowlist entry for a missing workflow is a stale-entry violation', () => {
	withDir({ 'bare.yml': UNFILTERED }, (dir) => {
		const { violations } = checkWorkflows(dir, { 'gone.yml': 'reason' }, {});
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
			checkWorkflows(dir, {}, {});
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
			const { violations } = checkWorkflows(dir, {}, {});
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
			const { violations } = checkWorkflows(dir, {}, {});
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
			const { violations } = checkWorkflows(dir, {}, {});
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
			const { violations } = checkWorkflows(dir, {}, {});
			assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
		},
	);
});

// --- Concurrency: a cancelling group that cannot distinguish two EVENTS. ---
//
// The four cases above vary the group KEY against one event. These vary the
// EVENT against a key that is already per-push, which is the axis that let a
// nightly `schedule` cancel a `push` run at the same commit: `github.head_ref`
// is empty for both, so both fall through to `github.sha`.

const SHA_KEY = 'a-${{ github.head_ref || github.sha }}';
const EVENT_KEY = 'a-${{ github.event_name }}-${{ github.head_ref || github.sha }}';
const on = (...triggers) => `\non:\n${triggers.map((t) => `  ${t}:\n`).join('')}`;
const wf = (triggers, group, cancels = 'true') =>
	`name: a${triggers}\nconcurrency:\n  group: ${group}\n  cancel-in-progress: ${cancels}\n${JOBS}`;

check('a per-push group is still rejected when two events share it', () => {
	withDir({ 'a.yml': wf(on('push', 'schedule'), SHA_KEY) }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${JSON.stringify(violations)}`);
		assert(/github\.event_name/.test(violations[0].message), 'expected the event wording');
	});
});

check('adding github.event_name to that group accepts it', () => {
	withDir({ 'a.yml': wf(on('push', 'schedule'), EVENT_KEY) }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('one non-pull_request trigger cannot collide, so the key is not required', () => {
	withDir({ 'a.yml': wf(on('push', 'pull_request'), SHA_KEY) }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('cancel-in-progress: false makes the event key irrelevant too', () => {
	withDir({ 'a.yml': wf(on('push', 'schedule'), SHA_KEY, 'false') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('two non-push events collide with each other, with no push in sight', () => {
	withDir({ 'a.yml': wf(on('schedule', 'workflow_dispatch'), SHA_KEY) }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${JSON.stringify(violations)}`);
		assert(/github\.event_name/.test(violations[0].message), 'expected the event wording');
	});
});

// --- The same mechanism one level down: a job-level cancelling group. ---

/** A push workflow whose single job `publish` carries `group` and `cancels`. */
function jobLevel(group, cancels = 'true') {
	return (
		`name: a${PUSH_ON}\njobs:\n  publish:\n    runs-on: ubuntu-latest\n` +
		`    concurrency:\n      group: ${group}\n      cancel-in-progress: ${cancels}\n` +
		`    steps:\n      - run: echo hi\n`
	);
}

check('a job-level block is still not read as the workflow-level one', () => {
	const { concurrency, jobs } = analyzeWorkflow(jobLevel('a-${{ github.ref }}'));
	assert(
		concurrency === null,
		`expected no top-level concurrency, got ${JSON.stringify(concurrency)}`,
	);
	assert(jobs.length === 1 && jobs[0].id === 'publish', `expected the job, got ${JSON.stringify(jobs)}`);
});

check('a ref-keyed cancelling job group on a push workflow is rejected', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.ref }}') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(/job `publish`/.test(violations[0].message), 'expected the job to be named');
	});
});

check('an allowlisted converging job group is accepted', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.ref }}') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, { 'a.yml': { publish: 'converges on one PR' } });
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a job group keyed by github.sha needs no entry', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.head_ref || github.sha }}') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a serialising job group (cancel-in-progress: false) needs no entry', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.ref }}', 'false') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a job group on a workflow with no push trigger is accepted', () => {
	const body = jobLevel('a-${{ github.ref }}').replace(PUSH_ON.trim(), 'on:\n  pull_request:');
	withDir({ 'a.yml': body }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, {});
		assert(violations.length === 0, `expected clean, got ${JSON.stringify(violations)}`);
	});
});

check('a job entry for a group that no longer cancels is a stale-entry violation', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.sha }}') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, { 'a.yml': { publish: 'converges' } });
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(/stale/i.test(violations[0].message), 'expected a stale-entry message');
	});
});

check('a job entry for a missing workflow is a stale-entry violation', () => {
	withDir({ 'a.yml': jobLevel('a-${{ github.sha }}') }, (dir) => {
		const { violations } = checkWorkflows(dir, {}, { 'gone.yml': { publish: 'converges' } });
		assert(violations.length === 1, `expected 1 violation, got ${violations.length}`);
		assert(violations[0].file === 'gone.yml', 'expected the missing file to be named');
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
	for (const [file, jobs] of Object.entries(JOB_CONCURRENCY_ALLOWLIST)) {
		for (const [id, reason] of Object.entries(jobs)) {
			assert(
				typeof reason === 'string' && reason.trim().length > 20,
				`${file}/${id}: reason too thin`,
			);
		}
	}
});

// A guard that is clean because it looks at nothing is also clean. Emptying the
// job allowlist must reproduce exactly the shipped entries against the real
// tree — the check is wired iff those two sets agree.
check('the shipped job allowlist is exactly what the real tree flags without it', () => {
	const { violations } = checkWorkflows(REAL_WORKFLOW_DIR, ALLOWLIST, {});
	const flagged = violations
		.map((v) => /^job `([^`]+)`/.exec(v.message)?.[1])
		.map((id, i) => (id ? `${violations[i].file}/${id}` : null))
		.filter(Boolean)
		.sort();
	const declared = Object.entries(JOB_CONCURRENCY_ALLOWLIST)
		.flatMap(([file, jobs]) => Object.keys(jobs).map((id) => `${file}/${id}`))
		.sort();
	assert(flagged.length > 0, 'expected the real tree to have job-level groups to flag');
	assert(
		JSON.stringify(flagged) === JSON.stringify(declared),
		`flagged ${JSON.stringify(flagged)} but declared ${JSON.stringify(declared)}`,
	);
});

console.log(
	failures === 0
		? '\nworkflow-trigger-guard self-test: all checks passed'
		: `\nworkflow-trigger-guard self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
