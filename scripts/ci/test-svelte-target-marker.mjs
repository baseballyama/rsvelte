#!/usr/bin/env node
// Controls for the Svelte target-version markers.
//
// README.md's version is written by `update-docs.mjs` and enforced by its
// `--check`. AGENTS.md carried the same fact in prose that nothing wrote and
// nothing checked, and it drifted — 5.56.8 against a pinned 5.56.9 (#3645).
// It now goes through the same writer, so the two files cannot disagree.
//
// The equality against the submodule stays in `--check`, which runs where the
// submodule is checked out. What runs here is everything that does not need it:
// the marker functions' behaviour, that both files still carry a marker for the
// writer to find, and that the workflow still calls the check at all.
//
// The functions are imported from `update-docs.mjs` rather than restated: a
// control whose oracle is a second copy of the thing it checks passes when both
// copies are wrong the same way.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { updateAgentsTargetMarker, updateSvelteTargetMarker } from '../dev/update-docs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

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

const SENTENCE = 'Source: `pnpm run compatibility-report` (Svelte **v9.9.9**).';
const MARKED = `<!-- svelte-target-version -->${SENTENCE}<!-- /svelte-target-version --> Re-run\nthe thing.\n`;

check('the AGENTS.md marker replaces a stale version', () => {
	const fixed = updateAgentsTargetMarker(MARKED, '1.2.3');
	assert.ok(fixed.includes('**v1.2.3**'), fixed);
	assert.ok(!fixed.includes('9.9.9'), fixed);
});

check('the AGENTS.md marker keeps the sentence on its own line', () => {
	const fixed = updateAgentsTargetMarker(MARKED, '1.2.3');
	// An inline marker is the whole point: a comment on its own line would end
	// the paragraph and orphan the rest of the sentence.
	assert.equal(fixed.split('\n').length, MARKED.split('\n').length, fixed);
	assert.ok(/<!-- \/svelte-target-version --> Re-run$/m.test(fixed), fixed);
});

check('an unmarked AGENTS.md sentence is adopted, once', () => {
	const prose = `## Test Status\n\n${SENTENCE} Re-run\nthe thing.\n`;
	const first = updateAgentsTargetMarker(prose, '1.2.3');
	assert.ok(first.includes('<!-- svelte-target-version -->'), first);
	assert.equal(updateAgentsTargetMarker(first, '1.2.3'), first, 'not idempotent');
});

check('the README marker replaces a stale version', () => {
	const stale =
		'<!-- svelte-target-version -->\n\n**Targeting Svelte `v9.9.9`** (old).\n<!-- /svelte-target-version -->\n';
	const fixed = updateSvelteTargetMarker(stale, '1.2.3', 'a'.repeat(40));
	assert.ok(fixed.includes('`v1.2.3`'), fixed);
	assert.ok(!fixed.includes('9.9.9'), fixed);
	assert.equal(updateSvelteTargetMarker(fixed, '1.2.3', 'a'.repeat(40)), fixed, 'not idempotent');
});

// Without a marker the writer falls back to a prose regex, and a reworded
// sentence would silently stop being written — the state AGENTS.md was in.
for (const name of ['AGENTS.md', 'README.md']) {
	check(`${name} carries a marker for the writer to find`, () => {
		const content = readFileSync(join(ROOT, name), 'utf8');
		assert.ok(
			content.includes('<!-- svelte-target-version -->') &&
				content.includes('<!-- /svelte-target-version -->'),
			`${name} has no svelte-target-version marker`,
		);
	});
}

check('ci.yml still runs update-docs --check, which owns the equality', () => {
	const yml = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
	assert.ok(
		yml.includes('scripts/dev/update-docs.mjs --check'),
		'ci.yml no longer runs update-docs --check',
	);
	assert.ok(
		yml.includes('scripts/ci/test-svelte-target-marker.mjs'),
		'ci.yml does not run this control',
	);
});

console.log(
	failures === 0
		? '\nsvelte-target-marker self-test: all checks passed'
		: `\nsvelte-target-marker self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
