#!/usr/bin/env node
/**
 * Guards the comparison key of the CSS-prune sweep
 * (scripts/compat-corpus/css-prune-verdict.mjs).
 *
 * The sweep's oracle used to be `css.code` alone. A nested rule whose enclosing
 * selector matches no ancestor prunes to the same byte-identical `(empty)`
 * stylesheet whether or not the outer rule is reported dead, so the sweep scored
 * a real `css_unused_selector` divergence as a match across its whole grid. The
 * inputs were generated the entire time; the comparison key was what could not
 * see them.
 *
 * The contract asserted here:
 *   - a warning-only divergence is a divergence (set, and position alone)
 *   - warning order is not significant (the keys are sorted)
 *   - a css divergence still reports as `css-mismatch`, not swallowed by the
 *     warning branch
 *   - error parity is decided before either, so an errored side never compares
 *     a stylesheet it does not have
 *   - the sweep actually routes its verdict through this module
 *
 * Usage: node scripts/dev/test-css-prune-sweep-warning-verdict.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictOf, warningKeys } from '../compat-corpus/css-prune-verdict.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

let failed = 0;
function check(name, ok, detail) {
	console.log(`${ok ? '  ✓' : '  ✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
	if (!ok) failed++;
}

const unused = (line, column) => ({ code: 'css_unused_selector', start: { line, column } });
const CSS = '\n\t/* (empty) .grand {\n\t\t.foo > .a { & + & { color: red; } }\n\t}*/\n';

// The exact shape the css.code-only key could not see: identical stylesheets,
// rsvelte missing the outer rule's warning.
const official = { css: CSS, warnings: warningKeys({ warnings: [unused(4, 2), unused(4, 14)] }) };
const rsvelte = { css: CSS, warnings: warningKeys({ warnings: [unused(4, 14)] }) };

console.log('css-prune sweep verdict contract');
check('identical css + warnings is a match', verdictOf(official, official) === 'match');
check(
	'missing warning on identical css is a divergence',
	verdictOf(official, rsvelte) === 'warning-mismatch',
	verdictOf(official, rsvelte)
);
check(
	'extra warning on identical css is a divergence',
	verdictOf(rsvelte, official) === 'warning-mismatch',
	verdictOf(rsvelte, official)
);
check(
	'a warning at the wrong position is a divergence',
	verdictOf(official, {
		css: CSS,
		warnings: warningKeys({ warnings: [unused(4, 2), unused(4, 15)] }),
	}) === 'warning-mismatch'
);
check(
	'warning order is not significant',
	verdictOf(official, {
		css: CSS,
		warnings: warningKeys({ warnings: [unused(4, 14), unused(4, 2)] }),
	}) === 'match'
);
check(
	'a css divergence still reports as css-mismatch',
	verdictOf(official, { css: CSS + '\n', warnings: rsvelte.warnings }) === 'css-mismatch'
);
check(
	'matching error codes are a match regardless of warnings',
	verdictOf(
		{ error: { code: 'css_expected_identifier', message: 'x' } },
		{ error: { code: 'css_expected_identifier', message: 'y' } }
	) === 'match (error parity)'
);
check(
	'one side erroring is an error-mismatch',
	verdictOf(official, { error: { code: 'css_expected_identifier', message: 'y' } }).startsWith(
		'error-mismatch'
	)
);

// A guarded comparator the sweep no longer calls guards nothing.
const sweep = fs.readFileSync(path.join(ROOT, 'scripts/compat-corpus/css-prune-sweep.mjs'), 'utf8');
check(
	'css-prune-sweep.mjs routes its verdict through this module',
	/import\s*\{[^}]*\bverdictOf\b[^}]*\}\s*from\s*'\.\/css-prune-verdict\.mjs'/.test(sweep) &&
		/\bverdictOf\(e,\s*a\)/.test(sweep)
);

if (failed) {
	console.error(`\n${failed} check(s) failed`);
	process.exit(1);
}
console.log('\nall checks passed');
