#!/usr/bin/env node
/**
 * Control for `codeIdentity`, the reduction that DEFINES the `code-mismatch` /
 * `comment-mismatch` split in `mutate-corpus.mjs` and `matrix/run.mjs`.
 *
 * The defect this guards: the reduction stripped comments with a plain regex,
 * which has no notion of a string literal, so a `//` inside one started a
 * "comment" that ran to the end of the line. The commonest instance in real
 * compiler output is `xmlns="http://www.w3.org/2000/svg"` — every inline SVG.
 * Code after it on that line was deleted from BOTH sides, so two programs that
 * genuinely differ there reduced to the same string and the gate scored the
 * divergence `comment-mismatch`, which only the code half is ratcheted on.
 *
 * This is a DISCRIMINATING control: the same pair is run through the retired
 * regex and the shipping reduction, and they must DISAGREE. Asserting only the
 * new verdict could not tell "the fix works" from "the input never reached the
 * branch".
 *
 * Usage: node scripts/dev/test-code-identity-strings.mjs
 */

import { codeIdentity } from '../compat-corpus/normalize.mjs';

const RETIRED = (source) =>
	source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');

let failures = 0;
function check(name, ok, detail) {
	if (ok) return;
	failures++;
	console.error(`[test-code-identity-strings] FAIL: ${name}${detail ? `\n  ${detail}` : ''}`);
}

// The pair differs in real code, on the line a string's `//` sits on.
const LEFT = 'const u = "http://www.w3.org/2000/svg"; let x = 1;\n';
const RIGHT = 'const u = "http://www.w3.org/2000/svg"; let x = 2;\n';

check(
	'the retired regex cannot see the difference (the control moves)',
	RETIRED(LEFT) === RETIRED(RIGHT),
	`retired already separated them: ${RETIRED(LEFT)} vs ${RETIRED(RIGHT)}`
);
check(
	'codeIdentity sees the difference',
	codeIdentity(LEFT) !== codeIdentity(RIGHT),
	`codeIdentity collapsed them to: ${codeIdentity(LEFT)}`
);

// It must still erase what it exists to erase — otherwise the reduction has
// simply stopped reducing, which no verdict here would distinguish.
check(
	'a real comment is still erased',
	codeIdentity('let x = 1; // a\n') === codeIdentity('let x = 1;\n'),
	`${codeIdentity('let x = 1; // a\n')} vs ${codeIdentity('let x = 1;\n')}`
);
check(
	'a real block comment is still erased',
	codeIdentity('let /* a */ x = 1;\n') === codeIdentity('let x = 1;\n')
);

// A template literal and a single-quoted string are the same hazard.
check(
	'a `//` inside a template literal is not a comment',
	codeIdentity('const u = `http://a`; let x = 1;\n') !==
		codeIdentity('const u = `http://a`; let x = 2;\n')
);
check(
	"a `//` inside a single-quoted string is not a comment",
	codeIdentity("const u = 'http://a'; let x = 1;\n") !==
		codeIdentity("const u = 'http://a'; let x = 2;\n")
);

// Known residue, asserted so it is recorded rather than assumed absent: whether
// a `/` opens a regex literal or is division is decided by the previous
// significant token, which this scanner does not track. A `//` or `/*` inside a
// regex character class therefore still starts a comment. Measured at 27 of
// 31546 corpus files, against 3429 before the string states were added.
const REGEX_RESIDUE_LEFT = 'const r = /[//]/; let x = 1;\n';
const REGEX_RESIDUE_RIGHT = 'const r = /[//]/; let x = 2;\n';
check(
	'the regex-literal residue is still present (recorded, not fixed)',
	codeIdentity(REGEX_RESIDUE_LEFT) === codeIdentity(REGEX_RESIDUE_RIGHT),
	'the regex residue is gone — update gate-coverage 20h, which records it as open'
);

if (failures) process.exit(1);
console.log('[test-code-identity-strings] OK (7 checks)');
