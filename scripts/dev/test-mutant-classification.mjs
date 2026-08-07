#!/usr/bin/env node
/**
 * Control for the mutant harness's classification of non-parsing output.
 *
 * The defect this guards: `mutate-corpus.mjs` used to decide "same or not" with
 * a hand-rolled string identity, which has no notion of parsing — so a mutant
 * whose output NO ENGINE WILL LOAD was filed as `code-mismatch`, beside
 * formatting noise. 78 such mutants across 48 components went unreported that
 * way (#2434).
 *
 * This is a DISCRIMINATING control, not a smoke test: the same input is run
 * through both classifiers and they must disagree. A test that only asserted
 * the new verdict could not tell "the fix works" from "the input never reached
 * the branch" — the failure mode that let the original defect ship.
 *
 * The pair is a minimized stand-in for the #2434 Cause 2 shape (a comment
 * carrying `)` makes the arrow's closing paren go missing), not one of the 78
 * literally: those live in `compatibility/mutant-artifacts/`, which only exists
 * after a full corpus run and so cannot be checked in.
 *
 * Usage: node scripts/dev/test-mutant-classification.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BIN = path.join(ROOT, 'target/release/ast_equiv_batch');

// Left parses; right lost the arrow body's closing paren and does not.
const LEFT = 'const f = () => ({ a: 1 });\nexport default f;\n';
const RIGHT = 'const f = () => ({ a: 1 };\nexport default f;\n';

// The retired classifier: strip comments and whitespace, compare as strings. It
// can only ever answer "differs", never "does not parse".
function codeIdentity(source) {
	return source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
}

function fail(message) {
	console.error(`[test-mutant-classification] FAIL: ${message}`);
	process.exit(1);
}

if (!fs.existsSync(BIN)) {
	// A missing oracle must fail, never skip: a skipped control reports success.
	fail(`missing ${path.relative(ROOT, BIN)} — build it: cargo build --release --bin ast_equiv_batch`);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mutant-classify-'));
const leftPath = path.join(dir, 'left.js');
const rightPath = path.join(dir, 'right.js');
fs.writeFileSync(leftPath, LEFT);
fs.writeFileSync(rightPath, RIGHT);

try {
	// Arm 1 — the retired classifier. Must report a mere difference, which the
	// harness bucketed as `code-mismatch`. If this ever stops differing, the
	// fixture has drifted and arm 2 proves nothing.
	if (codeIdentity(LEFT) === codeIdentity(RIGHT)) {
		fail('control arm: the fixture no longer differs under the string identity');
	}
	console.log('[test-mutant-classification] string identity: differs -> would file as code-mismatch');

	// Arm 2 — the shared comparator. Must report the strictly stronger fact.
	const out = execFileSync(BIN, [], {
		input: JSON.stringify([{ id: 'fixture', left: leftPath, right: rightPath }]),
		encoding: 'utf8',
	});
	const [verdict] = JSON.parse(out);
	if (verdict?.verdict !== 'unparseable') {
		fail(`ast_equiv_batch said "${verdict?.verdict}", expected "unparseable"`);
	}
	if (verdict.side !== 'right') {
		fail(`ast_equiv_batch blamed the "${verdict.side}" side, expected "right"`);
	}
	console.log(`[test-mutant-classification] ast_equiv_batch: unparseable (${verdict.side} side)`);

	console.log('[test-mutant-classification] ✅ one input, two opposite verdicts');
} finally {
	fs.rmSync(dir, { recursive: true, force: true });
}
