#!/usr/bin/env node
/**
 * Controls for the `parse()` AST comparator's sibling alignment.
 *
 * The property under test is that ONE dropped node reports ONE key. Pure index
 * pairing reported a median of 7 and up to 74, because every sibling after the
 * drop was compared against the wrong partner and each mismatch was filed under
 * its own key — naming node types the defect never touched.
 *
 * The property that is just as load-bearing, and that the first version of this
 * alignment failed, is that it must never report LESS accurately than the index
 * pairing it replaces. `(type, start, end)` is an identity, and a node whose
 * span or type is merely WRONG has a different identity — so aligning on
 * identity alone turns a `#span` into a phantom delete-plus-insert and a
 * mislabel into two keys where the walk already reports one. Measured over the
 * corpus that cost 7 `#span` and 5 `.type#value` keys. The alignment therefore
 * uses identity only to find ANCHORS and index-pairs the runs between them, and
 * three controls below pin exactly that:
 *
 * - `a_wrong_span_is_not_a_delete_and_insert`
 * - `a_mislabel_is_one_key_not_two`
 * - `a_field_change_is_not_a_delete_and_insert` — perturbing `type` perturbs
 *   the identity, so it tests alignment while looking like it tests fields.
 *   The perturbation here is on a non-identity leaf.
 *
 * And one control exists because the obvious implementation fails it:
 *
 * - `a_duplicate_span_is_not_one_node` — `(type, start, end)` is not unique.
 *   Upstream's acorn-typescript comment doubling puts two comments with the
 *   same span in one array, so a map keyed on the triple collapses them and
 *   deleting one reports NOTHING. That is looser than the index pairing being
 *   replaced, which is the one thing this change must not be.
 */

import assert from 'node:assert/strict';
import { diffKeys, idOf, alignSiblings } from '../compat-corpus/parse-ast-diff.mjs';

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

test('a_wrong_span_is_not_a_delete_and_insert: a moved sibling still reports #span', () => {
	// The node is present on both sides and its span is wrong. Identity-only
	// alignment de-pairs it and reports `#node-missing` + `#node-extra`, which
	// describes a deletion that did not happen and loses the actual finding.
	const official = { type: 'Program', start: 0, end: 30, body: [stmt('VariableDeclaration', 0, 10), stmt('IfStatement', 10, 20), stmt('ReturnStatement', 20, 30)] };
	const rsvelte = structuredClone(official);
	rsvelte.body[1].end = 21;
	assert.deepEqual(keysOf(official, rsvelte), ['IfStatement#span']);
});

test('a_mislabel_is_one_key_not_two: two node types at one span report .type#value', () => {
	// The walk already has a branch for this ("the mislabel IS the finding"),
	// and identity-only alignment never reaches it.
	const official = { type: 'Program', start: 0, end: 10, body: [stmt('CallExpression', 0, 10, { callee: null })] };
	const rsvelte = { type: 'Program', start: 0, end: 10, body: [stmt('NewExpression', 0, 10, { callee: null })] };
	assert.deepEqual(keysOf(official, rsvelte), ['CallExpression.type#value']);
});

test('a mislabel between two anchors is still one key', () => {
	// The anchors on either side are what makes the middle a one-element gap;
	// without them the whole array is one gap and the assertion above would
	// pass for the wrong reason.
	const official = { type: 'Program', start: 0, end: 30, body: [stmt('A', 0, 10), stmt('CallExpression', 10, 20, { callee: null }), stmt('C', 20, 30)] };
	const rsvelte = structuredClone(official);
	rsvelte.body[1].type = 'NewExpression';
	assert.deepEqual(keysOf(official, rsvelte), ['CallExpression.type#value']);
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
	assert.deepEqual(keysOf(official, rsvelte), ['Block#node-missing', 'Root.comments[]#length']);

	// A duplicated id is unique on neither side, so it is never an anchor; the
	// survivor is index-paired with the FIRST occurrence and the second is the
	// surplus.
	const aligned = alignSiblings(official.comments, rsvelte.comments);
	assert.deepEqual(aligned.pairs, [[0, 0], [2, 1]]);
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
	// The anchors after a deletion still increase, so nothing here is a reorder.
	// Over raw indices every sibling after the drop shifts, and that would be
	// the same spray this change exists to remove, wearing a different key.
	const official = { type: 'Program', start: 0, end: 40, body: [stmt('A', 0, 10), stmt('B', 10, 20), stmt('C', 20, 30), stmt('D', 30, 40)] };
	const rsvelte = structuredClone(official);
	rsvelte.body.splice(0, 1);
	assert.deepEqual(keysOf(official, rsvelte), ['A#node-missing', 'Program.body[]#length']);
});

test('a drop and a wrong span in one array report one key each', () => {
	// The two mechanisms must not mask each other: the drop is named, and the
	// moved node — which is in a different gap — still reports its span.
	const official = { type: 'Program', start: 0, end: 40, body: [stmt('A', 0, 10), stmt('B', 10, 20), stmt('C', 20, 30), stmt('D', 30, 40)] };
	const rsvelte = structuredClone(official);
	rsvelte.body[3].end = 41;
	rsvelte.body.splice(1, 1);
	assert.deepEqual(keysOf(official, rsvelte), ['B#node-missing', 'D#span', 'Program.body[]#length']);
});

test('arrays without identity keep index pairing', () => {
	// `ignores` is an array of strings: no type, no span. Index pairing is the
	// only thing available and must still run rather than being skipped.
	assert.equal(idOf('svelte-ignore'), null);
	assert.equal(alignSiblings(['a', 'b'], ['a', 'c']), null);
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
