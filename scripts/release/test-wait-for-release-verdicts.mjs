#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { verdict } from './wait-for-release-verdicts.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RELEASE_WORKFLOW = join(HERE, '..', '..', '.github', 'workflows', 'release.yml');
let failures = 0;

function check(name, fn) {
	try {
		fn();
		console.log(`  ok   ${name}`);
	} catch (error) {
		failures += 1;
		console.log(`  FAIL ${name}\n       ${error.message}`);
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function run(name, status = 'completed', conclusion = 'success', updated = 1) {
	return {
		name,
		status,
		conclusion,
		updated_at: new Date(updated).toISOString(),
		html_url: `https://example.test/${encodeURIComponent(name)}`,
	};
}

check('an absent required CI run is pending, not green', () => {
	assert(verdict([]).state === 'pending', 'zero runs must not pass');
});

check('the required CI run alone can pass when path-filtered workflows are absent', () => {
	assert(verdict([run('CI')]).state === 'success', 'successful CI should pass');
});

check('an observed optional workflow is part of the verdict', () => {
	const result = verdict([run('CI'), run('Corpus Compat', 'in_progress', null)]);
	assert(result.state === 'pending', `expected pending, got ${result.state}`);
});

check('failure, cancellation and action_required are all non-verdicts', () => {
	for (const conclusion of ['failure', 'cancelled', 'action_required']) {
		const result = verdict([run('CI'), run('C ABI', 'completed', conclusion)]);
		assert(result.state === 'failure', `${conclusion} must fail, got ${result.state}`);
	}
});

check('the newest rerun decides the workflow verdict', () => {
	const result = verdict([run('CI', 'completed', 'failure', 1), run('CI', 'completed', 'success', 2)]);
	assert(result.state === 'success', `expected newest success, got ${result.state}`);
});

check('release.yml wires verification into publish and grants read access', () => {
	const yml = readFileSync(RELEASE_WORKFLOW, 'utf8');
	assert(yml.includes('actions: read'), 'release workflow cannot read Actions verdicts');
	assert(
		yml.includes('node scripts/release/wait-for-release-verdicts.mjs'),
		'release workflow does not invoke the waiter',
	);
	const publish = yml.slice(yml.indexOf('\n  publish:'), yml.indexOf('\n  release-language-server-archives:'));
	assert(
		publish.includes('verify-release-commit'),
		'publish does not depend on release-commit verification',
	);
});

console.log(
	failures === 0
		? '\nrelease verdict waiter self-test: all checks passed'
		: `\nrelease verdict waiter self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
