#!/usr/bin/env node
/**
 * Controls for the `parse()` AST comparator's sibling alignment.
 *
 * The property under test is that ONE dropped node reports ONE key. Index
 * pairing reported a median of 7 and up to 74, because every sibling after the
 * drop was compared against the wrong partner and each mismatch was filed under
 * its own key — naming node types the defect never touched.
 *
 * Two of these controls exist because the obvious implementation fails them:
 *
 * - `a_duplicate_span_is_not_one_node` — `(type, start, end)` is not a unique
 *   identity. Upstream's acorn-typescript comment doubling puts two comments
 *   with the same span in one array, so a map keyed on the triple collapses
 *   them and deleting one reports NOTHING. That is looser than the index
 *   pairing being replaced, which is the one thing this change must not be.
 *
 * - `a_field_change_is_not_a_delete_and_insert` — perturbing `type` perturbs
 *   the identity, so it tests alignment while looking like it tests fields.
 *   The perturbation here is on a non-identity leaf.
 */

import assert from 'node:assert/strict';
import { diffKeys, idOf, alignByIdentity } from '../compat-corpus/parse-ast-diff.mjs';

let failures = 0;
const test = (name, fn) => {
	try {
		fn();
		console.log(`  ok   ${name}`);
	} catch (err) {
		failures++;
		console.error(`  FAIL ${name}\n       ${err.message}`);
	}
};

/** A statement-shaped node at a chosen span. */
const stmt = (type, start, end, extra = {}) => ({ type, start, end, ...extra });

const keysOf = (a, b) => {
	const out = new Set();
	diffKeys(a, b, out, '(root)', '');
	return [...out].sort();
};

console.log('[parse-ast-diff] alignment controls');

test('identical trees report nothing', () => {
	const tree = { type: 'Program', start: 0, end: 30, body: [stmt('VariableDeclaration', 0, 10), stmt('IfStatement', 10, 20), stmt('ReturnStatement', 20, 30)] };
	assert.deepEqual(keysOf(tree, structuredClone(tree)), []);
});

test('one dropped node is one node key plus the length key', () => {
	const official = {
		type: 'Program',
		start: 0,
		end: 30,
		body: [stmt('VariableDeclaration', 0, 10), stmt('IfStatement', 10, 20), stmt('ReturnStatement', 20, 30)],
	};
	const rsvelte = structuredClone(official);
	rsvelte.body.splice(1, 1);
	const keys = keysOf(official, rsvelte);
	// The two survivors must still pair with themselves: under index pairing
	// `ReturnStatement` was compared against `IfStatement` and reported
	// `.type#value`, and the spans sprayed further keys under both.
	assert.deepEqual(keys, ['IfStatement#node-missing', 'Program.body[]#length']);
});

test('the dropped node is named even when it is the last element', () => {
	const official = { type: 'Program', start: 0, end: 20, body: [stmt('VariableDeclaration', 0, 10), stmt('ReturnStatement', 10, 20)] };
	const rsvelte = structuredClone(official);
	rsvelte.body.pop();
	assert.deepEqual(keysOf(official, rsvelte), ['Program.body[]#length', 'ReturnStatement#node-missing']);
});

test('an extra node on rsvelte’s side is reported, not skipped', () => {
	const official = { type: 'Program', start: 0, end: 10, body: [stmt('VariableDeclaration', 0, 10)] };
	const rsvelte = structuredClone(official);
	rsvelte.body.push(stmt('EmptyStatement', 10, 11));
	assert.deepEqual(keysOf(official, rsvelte), ['EmptyStatement#node-extra', 'Program.body[]#length']);
});

test('a_duplicate_span_is_not_one_node: deleting one of two identical spans still reports', () => {
	// Upstream emits the same comment twice, at the identical span. A map keyed
	// on (type, start, end) collapses the pair, and this control reads [].
	const official = {
		type: 'Root',
		start: 0,
		end: 20,
		comments: [stmt('Block', 5, 12), stmt('Block', 5, 12), stmt('Line', 13, 20)],
	};
	const rsvelte = structuredClone(official);
	rsvelte.comments.splice(1, 1);
	const keys = keysOf(official, rsvelte);
	assert.deepEqual(keys, ['Block#node-missing', 'Root.comments[]#length']);

	// and the alignment itself must pair the survivor with the FIRST occurrence
	const aligned = alignByIdentity(official.comments, rsvelte.comments);
	assert.equal(aligned.pairs.length, 2, 'two of the three must pair');
	assert.deepEqual(aligned.onlyA, [1], 'the unpaired one is an occurrence, not a span');
});

test('two identical spans present on both sides report nothing', () => {
	const tree = { type: 'Root', start: 0, end: 20, comments: [stmt('Block', 5, 12), stmt('Block', 5, 12)] };
	assert.deepEqual(keysOf(tree, structuredClone(tree)), []);
});

test('a_field_change_is_not_a_delete_and_insert: a non-identity leaf reports its own field', () => {
	// `type`, `start` and `end` are the identity, so perturbing any of them
	// tests alignment while reading as a field test. `name` is not.
	const official = { type: 'Program', start: 0, end: 10, body: [stmt('Identifier', 0, 10, { name: 'a' })] };
	const rsvelte = structuredClone(official);
	rsvelte.body[0].name = 'b';
	assert.deepEqual(keysOf(official, rsvelte), ['Identifier.name#value']);
});

test('a reorder is reported rather than silently paired away', () => {
	const official = { type: 'Program', start: 0, end: 20, body: [stmt('A', 0, 10), stmt('B', 10, 20)] };
	const rsvelte = { type: 'Program', start: 0, end: 20, body: [stmt('B', 10, 20), stmt('A', 0, 10)] };
	assert.deepEqual(keysOf(official, rsvelte), ['Program.body[]#order']);
});

test('a drop does not report the following siblings as reordered', () => {
	// The order test runs over the MATCHED subsequence. Over raw indices every
	// sibling after a deletion shifts, so this would be the same spray under a
	// different key.
	const official = { type: 'Program', start: 0, end: 40, body: [stmt('A', 0, 10), stmt('B', 10, 20), stmt('C', 20, 30), stmt('D', 30, 40)] };
	const rsvelte = structuredClone(official);
	rsvelte.body.splice(0, 1);
	assert.deepEqual(keysOf(official, rsvelte), ['A#node-missing', 'Program.body[]#length']);
});

test('arrays without identity keep index pairing', () => {
	// `ignores` is an array of strings: no type, no span. Index pairing is the
	// only thing available and must still run rather than being skipped.
	assert.equal(idOf('svelte-ignore'), null);
	assert.equal(alignByIdentity(['a', 'b'], ['a', 'c']), null);
	const official = { type: 'Comment', start: 0, end: 10, ignores: ['a11y_x'] };
	const rsvelte = structuredClone(official);
	rsvelte.ignores[0] = 'a11y_y';
	assert.deepEqual(keysOf(official, rsvelte), ['Comment.ignores[]#value']);
});

test('a typeless object in the array falls back to index pairing', () => {
	assert.equal(idOf({ start: 0, end: 1 }), null, 'no type');
	assert.equal(idOf({ type: 'X', start: 0 }), null, 'no end');
	assert.equal(idOf(null), null);
	assert.equal(idOf([1]), null);
	assert.equal(idOf({ type: 'X', start: 0, end: 1 }), 'X 0 1');
});

test('a mislabelled node is still one key', () => {
	// The two sides disagree about `type` at the same span, so they do not pair.
	// Neither the old walk nor this one descends into a mislabel.
	const official = { type: 'Program', start: 0, end: 10, body: [stmt('CallExpression', 0, 10, { callee: null })] };
	const rsvelte = { type: 'Program', start: 0, end: 10, body: [stmt('NewExpression', 0, 10, { callee: null })] };
	const keys = keysOf(official, rsvelte);
	assert.deepEqual(keys, ['CallExpression#node-missing', 'NewExpression#node-extra']);
});

test('nested drops report once each, not once per ancestor', () => {
	const official = {
		type: 'Program',
		start: 0,
		end: 60,
		body: [
			stmt('FunctionDeclaration', 0, 30, { body: { type: 'BlockStatement', start: 10, end: 30, body: [stmt('X', 12, 20), stmt('Y', 20, 28)] } }),
			stmt('FunctionDeclaration', 30, 60, { body: { type: 'BlockStatement', start: 40, end: 60, body: [stmt('X', 42, 50), stmt('Y', 50, 58)] } }),
		],
	};
	const rsvelte = structuredClone(official);
	rsvelte.body[0].body.body.splice(0, 1);
	rsvelte.body[1].body.body.splice(0, 1);
	// Both drops are the same node type at the same relative path, so the field
	// key collapses them — that is the field-level key doing its job, and the
	// point is that neither sprays onto `Y`.
	assert.deepEqual(keysOf(official, rsvelte), ['BlockStatement.body[]#length', 'X#node-missing']);
});

if (failures > 0) {
	console.error(`\n[parse-ast-diff] ${failures} control(s) failed`);
	process.exit(1);
}
console.log('[parse-ast-diff] all controls pass');
