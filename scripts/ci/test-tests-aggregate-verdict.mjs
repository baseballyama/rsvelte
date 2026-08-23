#!/usr/bin/env node
// Self-test for scripts/ci/tests-aggregate-verdict.mjs.
//
// The behaviour this file defends is a *message*, and a message is exactly the
// kind of thing that regresses silently — nothing else in CI reads it. So each
// case pins both the exit code and the discriminating phrase, and the pairs are
// chosen so that a script which returned one constant verdict would fail here.
//
// The exit codes must stay identical to the inline bash this replaced: 0 only
// when every leg succeeded, 1 for anything else. Cancellation is not a pass.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEGS, verdict } from './tests-aggregate-verdict.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CI_WORKFLOW = join(HERE, '..', '..', '.github', 'workflows', 'ci.yml');

let failures = 0;

function check(name, fn) {
	try {
		fn();
		console.log(`  ok   ${name}`);
	} catch (err) {
		failures += 1;
		console.log(`  FAIL ${name}\n       ${err.message}`);
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const KEYS = LEGS.map(([, key]) => key);
const all = (result) => Object.fromEntries(KEYS.map((key) => [key, result]));
const withOne = (key, result) => ({ ...all('success'), [key]: result });

check('every leg green exits 0', () => {
	const { code } = verdict(all('success'));
	assert(code === 0, `expected 0, got ${code}`);
});

check('one real failure exits 1 and names FAILED, not cancellation', () => {
	const { code, message } = verdict(withOne('RUNTIME', 'failure'));
	assert(code === 1, `expected 1, got ${code}`);
	assert(message.includes('FAILED'), message);
	assert(message.includes('test-runtime'), message);
	assert(!message.includes('NO VERDICT'), message);
});

check('every leg cancelled exits 1 and says NO VERDICT', () => {
	const { code, message } = verdict(all('cancelled'));
	assert(code === 1, `expected 1, got ${code}`);
	assert(message.includes('NO VERDICT'), message);
	assert(message.includes('CANCELLED'), message);
	assert(!message.includes('FAILED'), message);
});

// The discriminating pair: a failure alongside cancellations must NOT be
// reported as "no verdict" — there is a verdict and it is bad.
check('a failure among cancellations reports the failure', () => {
	const env = { ...all('cancelled'), UNIT: 'failure' };
	const { code, message } = verdict(env);
	assert(code === 1, `expected 1, got ${code}`);
	assert(message.includes('FAILED'), message);
	assert(message.includes('test-unit'), message);
	assert(!message.includes('NO VERDICT'), message);
});

check('a skipped leg is not a pass', () => {
	const { code, message } = verdict(withOne('FMT_CORPUS', 'skipped'));
	assert(code === 1, `expected 1, got ${code}`);
	assert(message.includes('did not run'), message);
});

check('a missing env var is treated as did-not-run, not as success', () => {
	const env = all('success');
	delete env.LANGUAGE_SERVER;
	const { code } = verdict(env);
	assert(code === 1, `expected 1, got ${code}`);
});

check('an unrecognised result is loud rather than silently non-fatal', () => {
	const { code, message } = verdict(withOne('BULK', 'neutral'));
	assert(code === 2, `expected 2, got ${code}`);
	assert(message.includes('Unrecognised'), message);
});

// A verdict script nothing calls is worth nothing, and the workflow is the only
// caller. This is the wiring check — the same shape as the trigger guard's.
check('ci.yml invokes this script and declares every leg it reads', () => {
	const yml = readFileSync(CI_WORKFLOW, 'utf8');
	assert(
		yml.includes('scripts/ci/tests-aggregate-verdict.mjs'),
		'ci.yml does not call tests-aggregate-verdict.mjs',
	);
	for (const key of KEYS) {
		assert(new RegExp(`^\\s+${key}:`, 'm').test(yml), `ci.yml declares no ${key} env var`);
	}
	// The job carried no checkout while its verdict was inline bash, so the
	// first run of the script died with MODULE_NOT_FOUND — a red `Tests` that
	// says nothing about the tests, which is the exact confusion this script
	// exists to remove.
	const job = yml.slice(yml.indexOf('\n  tests:'), yml.indexOf('\n  compatibility-report:'));
	assert(
		/uses: actions\/checkout@/.test(job),
		'the `tests` job runs a script from the repo but never checks it out',
	);
});

console.log(
	failures === 0
		? '\ntests-aggregate-verdict self-test: all checks passed'
		: `\ntests-aggregate-verdict self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
