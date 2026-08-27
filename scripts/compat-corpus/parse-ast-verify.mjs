#!/usr/bin/env node
/**
 * Public `parse()` AST parity (#3389).
 *
 * Every other gate here compares what `compile()` produced — text, warnings,
 * errors, TSX, lint findings, LSP responses. `parse()` is a separate documented
 * export of `svelte/compiler`; it is what svelte2tsx, eslint-plugin-svelte and
 * an editor integration consume, and until this script nothing compared its
 * return value to official's. The two suites that come closest
 * (`crates/rsvelte_core/tests/parser_fixtures.rs`) compare rsvelte's INTERNAL
 * `parse` against upstream's checked-in `output.json` on 108 samples, with the
 * AST mode chosen by the fixture directory and `loc.*.character` deleted from
 * both sides before the assert — so the public entry point's own option
 * handling, that field, and every real-world component sit outside them.
 *
 * ## Unit
 *
 * One (corpus entry, axis) pair. Axes:
 *
 *   - `modern` — `parse(source, { modern: true })` on both sides.
 *   - `legacy` — `parse(source)` on both sides: the DEFAULT return shape, which
 *     upstream documents as the legacy AST until Svelte 6.
 *   - `loose`  — a fixed inline set of sources official rejects unless `loose`
 *     is set. Inline rather than collected because published code compiles:
 *     the population `loose` exists for cannot be found in a corpus.
 *
 * Both sides are compared after a `JSON.parse(JSON.stringify(...))` round-trip.
 * That is not cosmetic. Official's modern AST keeps `EachBlock.index`,
 * `EachBlock.key` and `SnippetBlock.typeParams` as present-but-`undefined`
 * keys, which survive `Object.keys` and do not survive `JSON.stringify`; a
 * keyset comparison reports three fields no consumer of the JSON boundary can
 * observe. And rsvelte's NAPI `parse` returns a JSON *string* where official
 * returns an object, so comparing them directly reports every entry divergent.
 *
 * The round-trip has its own trap, and this gate fell into it before shipping:
 * a `1n` literal puts a real `BigInt` in official's `Literal.value`, and
 * `JSON.stringify` THROWS on one. With the serialization inside the same `try`
 * as the parse, 11 corpus entries were recorded as "official rejects this
 * document" when official had parsed all 11 perfectly. Serialization is now
 * outside the parse `try`, and bigints go through a replacer so the value stays
 * comparable rather than being dropped.
 *
 * ## Ratchet key — a field, not a file
 *
 * `compatibility/parse-ast-known-failures.json` maps
 * `<axis>::<NodeType>.<field>#<kind>` to the cluster it belongs to. The key is
 * derived from the point of divergence: the `type` of the nearest enclosing
 * typed object, the path from there, and whether the field is missing on
 * rsvelte's side (`missing`), present only there (`extra`), a different value
 * (`value`), a different JSON type (`type`) or an array of a different length
 * (`length`).
 *
 * Two other keys were tried first and both were worse, which is why this one is
 * spelled out here:
 *
 *   - **per entry id** — one systemic divergence (`Root.end`, #3386) covers
 *     essentially every file that ends in a newline, so the baseline is a
 *     five-figure JSON that churns on every submodule bump. `mutate-corpus.mjs`
 *     already declined that trade for the same reason.
 *   - **per set of divergent JSON paths** — the sets of *independent* defects
 *     multiply: 472 classes over 4,468 files, where a file that happens to
 *     carry two unrelated divergences is its own class.
 *
 * The absolute JSON path is not used either: it carries the nesting chain, so
 * one defect appears once per depth it is reachable at (1,248 keys instead of
 * 738 on the same sweep).
 *
 * What this key CANNOT separate is two entries that diverge in the same field
 * of the same node type with different values — see gate-coverage 39.
 *
 * Usage:
 *   node scripts/compat-corpus/parse-ast-verify.mjs
 *   node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline
 *   node scripts/compat-corpus/parse-ast-verify.mjs --filter bits-ui --report-only
 *   node scripts/compat-corpus/parse-ast-verify.mjs --comment-owners
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { assertOracleCompiles, OFFICIAL_COMPILER_REL } from './oracle.mjs';
import { unattributedBindingReason, BINDING_REL } from './binding.mjs';
import { refuseUnrepresentativeBaseline } from './baseline-guard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const RATCHET = path.join(CORPUS, 'parse-ast-known-failures.json');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const FILTER = argValue('--filter', null);
const REPORT_ONLY = args.includes('--report-only');
const UPDATE = args.includes('--update-baseline');
const COMMENT_OWNERS = args.includes('--comment-owners');
const BINDING = path.resolve(ROOT, argValue('--binding', BINDING_REL));

/**
 * A comparison that scores `match` when there was nothing to compare is a clean
 * green, and this repo has shipped exactly that (0 pairs compared,
 * 14,179/14,179 match, because the precondition quantified with `some` twice).
 * The floor is on the number of pairs the run actually COMPARED, not on the
 * number of files it found, so a sweep where every parse threw still fails.
 */
const MIN_COMPONENTS = 10000;

// ---------------------------------------------------------------------------
// loose axis — sources official rejects unless `loose` is set. `valid-control`
// and `stray-closing-tag` are the controls at the two ends: one both sides must
// accept, one both sides must still reject (`loose` is not blanket recovery).
// ---------------------------------------------------------------------------

const LOOSE_SOURCES = {
	'unclosed-element': '<div><b>x',
	'unclosed-block': '{#if a}<b>x</b>',
	'empty-expression': '<b>{ }</b>',
	'unclosed-attribute-quote': '<div class="a>text</div>',
	'unterminated-script': '<script>let a = 1;',
	'stray-closing-tag': '</div>',
	'valid-control': '<b>x</b>',
};

// ---------------------------------------------------------------------------
// clusters — documentation only. The RATCHET key is read off the data; this
// table is what `parse-ast-known-failures.md` partitions its count by, so a
// key nobody has classified reads as `unclustered` rather than silently
// joining someone else's cluster.
// ---------------------------------------------------------------------------

const CLUSTERS = [
	[/#official-rejects/, 'accepts-what-official-rejects'],
	[/#rsvelte-rejects/, 'rejects-what-official-accepts'],
	[/^legacy::\(root\)\./, 'ast-mode'],
	[/^modern::Root#span$/, 'root-span'],
	[/\.(leadingComments|trailingComments)/, 'comment-attachment'],
	[/\.loc#(missing|extra)$/, 'loc-presence'],
	[/#span$/, 'span'],
	[/\.type#value$/, 'node-type'],
	[/^(modern|legacy)::[A-Za-z]*(Directive|Attribute)\.(expression|modifiers)#/, 'directive-null-fields'],
	[
		/\.(importKind|exportKind|attributes|accessor|decorators|optional|definite|declare|readonly|abstract|override|accessibility|typeAnnotation|typeArguments|typeParameters|returnType|superTypeArguments|superTypeParameters)#/,
		'estree-fields',
	],
	[/::(\w*Selector|Combinator|StyleSheet|Style|Rule|Atrule|Nth|Percentage|Block|Declaration)\b/, 'css-shape'],
	[/\[\]#length$/, 'child-count'],
];

const clusterOf = (key) => CLUSTERS.find(([re]) => re.test(key))?.[1] ?? 'unclustered';

// ---------------------------------------------------------------------------

function fail(message) {
	console.error(`[parse-ast] ${message}`);
	process.exit(2);
}

assertOracleCompiles(ROOT, 'parse-ast');
if (!fs.existsSync(BINDING)) {
	fail(
		`no NAPI binding at ${path.relative(ROOT, BINDING)} — run \`cargo build --release -p rsvelte_napi --lib\`, then \`node scripts/compat-corpus/binding.mjs --stage\``
	);
}

const manifestPath = path.join(CORPUS, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
	fail('no compatibility/manifest.json — run `node scripts/compat-corpus/collect.mjs` first');
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
	// `parse()` takes a component. A `.svelte.js` / `.svelte.ts` module goes
	// through `compileModule`, which exposes no AST at all.
	.filter((e) => e.id.endsWith('.svelte'))
	.filter((e) => !FILTER || e.id.includes(FILTER));

const require = createRequire(import.meta.url);
const official = await import(path.join(ROOT, OFFICIAL_COMPILER_REL));
const rsvelte = require(BINDING);

// ---------------------------------------------------------------------------
// comparison
// ---------------------------------------------------------------------------

/**
 * A `1n` literal makes official's AST carry a real `BigInt` in `Literal.value`,
 * and `JSON.stringify` THROWS on one. With the serialization inside the same
 * `try` as the parse, 11 corpus entries were scored "official rejects this
 * document" when official had parsed them perfectly — a finding that is entirely
 * the probe, which is why the two steps are separate functions here. The
 * replacer keeps the value comparable instead of dropping it: rsvelte has to
 * spell a bigint *somehow* across a JSON boundary, and whatever it picks is a
 * divergence this gate should report rather than hide.
 */
const jsonSafe = (value) =>
	JSON.parse(JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? { __bigint__: v.toString() } : v)));

const officialParse = (source, options) => official.parse(source, options);
const rsvelteParse = (source, options) => rsvelte.parse(source, options);

/**
 * Collect the divergence keys of two JSON values. `ctx` is the `type` of the
 * nearest enclosing typed object and `rel` the path since it, so a defect
 * reachable at four nesting depths is one key rather than four.
 */
function diffKeys(a, b, out, ctx, rel, depth = 0) {
	if (a === b || depth > 100) return;
	const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
	const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
	if (ta !== tb) {
		out.add(`${ctx}${rel}#type`);
		return;
	}
	if (ta === 'array') {
		if (a.length !== b.length) out.add(`${ctx}${rel}[]#length`);
		const n = Math.min(a.length, b.length);
		for (let i = 0; i < n; i++) diffKeys(a[i], b[i], out, ctx, `${rel}[]`, depth + 1);
		return;
	}
	if (ta === 'object') {
		// Official's type wins the context: a node rsvelte mislabels must not
		// file its divergence under the wrong node type.
		if (typeof a.type === 'string') {
			ctx = a.type;
			rel = '';
			// Two different node types have no fields in common to compare, so
			// descending would spray one divergence across every field of the
			// two shapes (a `TemplateLiteral.callee#extra` that means nothing).
			// The mislabel IS the finding.
			if (a.type !== b.type) {
				out.add(`${ctx}.type#value`);
				return;
			}
		}
		for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
			const inA = Object.hasOwn(a, key);
			const inB = Object.hasOwn(b, key);
			if (inA && !inB) out.add(`${ctx}${rel}.${key}#missing`);
			else if (!inA && inB) out.add(`${ctx}${rel}.${key}#extra`);
			// `start`, `end` and `loc` are one fact — where the node is — derived
			// from the same offsets. Compared field by field they are six keys
			// per node type (`loc.start.line`, `loc.end.column`, …) for a single
			// off-by-one, so a divergence in any of them is one `#span` key.
			// Their PRESENCE stays separate above: a node with no `loc` at all is
			// a different defect from a node whose `loc` is wrong.
			else if (key === 'start' || key === 'end' || key === 'loc') {
				if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) out.add(`${ctx}${rel}#span`);
			} else diffKeys(a[key], b[key], out, ctx, `${rel}.${key}`, depth + 1);
		}
		return;
	}
	out.add(`${ctx}${rel}#value`);
}

/**
 * Index comment ownership independently of the JSON-path diff. A field-level
 * ratchet key deliberately collapses every instance of (for example)
 * `ArrowFunctionExpression.leadingComments`, so it cannot say whether 200
 * comments or one comment still move between otherwise aligned nodes. The
 * owner index joins comments by their own immutable source range, then names
 * every owner by `(type, start, end)` — the same alignment #3702 uses. A
 * comment can have more than one owner when upstream replays its shared root
 * comment list while parsing a later script.
 */
function commentOwnerIndex(root) {
	const nodeKeys = new Set();
	const comments = new Map();

	function visit(value) {
		if (!value || typeof value !== 'object') return;
		if (Array.isArray(value)) {
			for (const item of value) visit(item);
			return;
		}

		if (typeof value.type === 'string') {
			const nodeKey = `${value.type}\0${value.start}\0${value.end}`;
			nodeKeys.add(nodeKey);
			for (const field of ['leadingComments', 'trailingComments']) {
				for (const comment of value[field] ?? []) {
					const commentKey = `${comment.start}\0${comment.end}`;
					const owners = comments.get(commentKey) ?? [];
					owners.push({
						nodeKey,
						label: `${value.type}.${field}`,
					});
					comments.set(commentKey, owners);
				}
			}
		}

		for (const [field, child] of Object.entries(value)) {
			if (field === 'leadingComments' || field === 'trailingComments' || field === 'comments') {
				continue;
			}
			visit(child);
		}
	}

	visit(root);
	return { nodeKeys, comments };
}

function commentOwnerDiff(expected, actual) {
	const a = commentOwnerIndex(expected);
	const b = commentOwnerIndex(actual);
	const out = [];
	for (const [commentKey, expectedOwners] of a.comments) {
		const actualRemaining = [...(b.comments.get(commentKey) ?? [])];
		const expectedRemaining = [];
		for (const expectedOwner of expectedOwners) {
			const exact = actualRemaining.findIndex(
				(actualOwner) =>
					actualOwner.nodeKey === expectedOwner.nodeKey &&
					actualOwner.label === expectedOwner.label
			);
			if (exact === -1) expectedRemaining.push(expectedOwner);
			else actualRemaining.splice(exact, 1);
		}

		// The official parser can attach one source comment to multiple nodes:
		// its shared root comment list is replayed when a later <script> is
		// parsed. Compare all owners, not whichever traversal visits last.
		const moved = Math.min(expectedRemaining.length, actualRemaining.length);
		for (let i = 0; i < moved; i++) {
			const expectedOwner = expectedRemaining[i];
			const actualOwner = actualRemaining[i];
			out.push({
				transition: `${expectedOwner.label} -> ${actualOwner.label}`,
				expectedOwnerMissing: !b.nodeKeys.has(expectedOwner.nodeKey),
				kind: 'moved',
			});
		}
		for (const expectedOwner of expectedRemaining.slice(moved)) {
			out.push({
				transition: `${expectedOwner.label} -> ABSENT`,
				expectedOwnerMissing: !b.nodeKeys.has(expectedOwner.nodeKey),
				kind: 'missing',
			});
		}
		for (const actualOwner of actualRemaining.slice(moved)) {
			out.push({
				transition: `ABSENT -> ${actualOwner.label}`,
				expectedOwnerMissing: false,
				kind: 'extra',
			});
		}
	}
	for (const [commentKey, actualOwners] of b.comments) {
		if (a.comments.has(commentKey)) continue;
		for (const actualOwner of actualOwners) {
			out.push({
				transition: `ABSENT -> ${actualOwner.label}`,
				expectedOwnerMissing: false,
				kind: 'extra',
			});
		}
	}
	return out;
}

/**
 * One comparison. `both-reject` is a verdict, not a key: rsvelte's binding
 * surfaces a Rust `Debug` string rather than a Svelte error code, so the two
 * rejections are not comparable here (gate-coverage 39c).
 */
function compareOne(id, source, options) {
	let expected;
	let expectedError = null;
	try {
		expected = officialParse(source, options);
	} catch (e) {
		expectedError = e;
	}
	let actual;
	let actualError = null;
	try {
		actual = rsvelteParse(source, options);
	} catch (e) {
		actualError = e;
	}
	// An acceptance divergence is a fact about a DOCUMENT, not about a field, so
	// it is keyed per entry: there are 26 of them, and a single shared key could
	// not tell 13 entries from 12 — a fix would shrink nothing the gate can see.
	if (expectedError && actualError) return { compared: false };
	const suffix = id === null ? '' : `::${id}`;
	if (expectedError) return { compared: true, keys: [`(accepted)#official-rejects${suffix}`] };
	if (actualError) return { compared: true, keys: [`(rejected)#rsvelte-rejects${suffix}`] };
	// Serialization is deliberately OUTSIDE the parse `try`: a failure here is a
	// harness fault, and scoring it as a rejection is how a probe manufactures a
	// finding. Nothing is expected to throw now that bigints are handled, so let
	// it escape rather than be absorbed into a verdict.
	const expectedJson = jsonSafe(expected);
	const actualJson = JSON.parse(actual);
	const keys = new Set();
	diffKeys(expectedJson, actualJson, keys, '(root)', '');
	return {
		compared: true,
		keys: [...keys],
		commentOwners: COMMENT_OWNERS ? commentOwnerDiff(expectedJson, actualJson) : [],
	};
}

// ---------------------------------------------------------------------------
// sweep
// ---------------------------------------------------------------------------

/** @type {Map<string, number>} entries exhibiting each key */
const observed = new Map();
/** @type {Map<string, string>} */
const firstExample = new Map();
const AXIS_NAMES = ['modern', 'legacy', 'loose'];
const compared = { modern: 0, legacy: 0, loose: 0 };
const bothReject = { modern: 0, legacy: 0, loose: 0 };
const agreed = { modern: 0, legacy: 0, loose: 0 };
/** @type {Map<string, number>} aligned comment-owner transitions by axis */
const commentOwnerTransitions = new Map();
/** @type {Map<string, string>} */
const firstCommentOwnerExample = new Map();
let commentOwnerMovementTotal = 0;
const missingCommentOwnerNodes = { modern: 0, legacy: 0, loose: 0 };
const commentOwnerKinds = {
	modern: { moved: 0, missing: 0, extra: 0 },
	legacy: { moved: 0, missing: 0, extra: 0 },
	loose: { moved: 0, missing: 0, extra: 0 },
};

function record(axis, prefix, id, result) {
	if (!result.compared) {
		bothReject[axis]++;
		return;
	}
	compared[axis]++;
	for (const owner of result.commentOwners ?? []) {
		if (owner.expectedOwnerMissing) {
			missingCommentOwnerNodes[axis]++;
			continue;
		}
		commentOwnerKinds[axis][owner.kind]++;
		if (owner.kind !== 'moved') continue;
		const key = `${axis}::${owner.transition}`;
		commentOwnerTransitions.set(key, (commentOwnerTransitions.get(key) ?? 0) + 1);
		if (!firstCommentOwnerExample.has(key)) firstCommentOwnerExample.set(key, id);
	}
	if (result.keys.length === 0) {
		agreed[axis]++;
		return;
	}
	for (const raw of result.keys) {
		const key = `${prefix}::${raw}`;
		observed.set(key, (observed.get(key) ?? 0) + 1);
		if (!firstExample.has(key)) firstExample.set(key, id);
	}
}

const AXES = [
	{ name: 'modern', options: { modern: true } },
	// No options at all — the shape a caller writing `parse(source)` gets.
	{ name: 'legacy', options: undefined },
];

for (const entry of manifest) {
	const source = fs.readFileSync(path.join(CORPUS, 'sources', entry.id), 'utf8');
	for (const axis of AXES) {
		record(axis.name, axis.name, entry.id, compareOne(entry.id, source, axis.options));
	}
}
// The loose population is seven inline sources, so its keys carry the source
// name: one shared key could not tell "three sources still fail" from "one
// does", which is the whole shrink the ratchet exists to observe.
for (const [name, source] of Object.entries(LOOSE_SOURCES)) {
	record('loose', `loose:${name}`, name, compareOne(null, source, { modern: true, loose: true }));
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

const totalCompared = compared.modern + compared.legacy + compared.loose;
console.log(
	`[parse-ast] ${manifest.length} component entries x ${AXES.length} axes + ${Object.keys(LOOSE_SOURCES).length} loose sources`
);
for (const axis of AXIS_NAMES) {
	console.log(
		`[parse-ast]   ${axis}: ${compared[axis]} compared, ${agreed[axis]} identical, ${compared[axis] - agreed[axis]} divergent, ${bothReject[axis]} both-reject`
	);
}
console.log(`[parse-ast] compared pairs: ${totalCompared}`);

const sorted = [...observed.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
const byCluster = new Map();
for (const [key] of sorted) {
	const c = clusterOf(key);
	byCluster.set(c, (byCluster.get(c) ?? 0) + 1);
}
console.log(`[parse-ast] ${observed.size} divergence keys in ${byCluster.size} clusters:`);
for (const [c, n] of [...byCluster].sort((a, b) => b[1] - a[1])) {
	console.log(`[parse-ast]   ${String(n).padStart(4)} keys  ${c}`);
}
for (const [key, count] of sorted) {
	console.log(`[parse-ast]   ${String(count).padStart(6)}  ${key}   e.g. ${firstExample.get(key)}`);
}

if (COMMENT_OWNERS) {
	const transitions = [...commentOwnerTransitions.entries()].sort(
		(a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)
	);
	commentOwnerMovementTotal = transitions.reduce((sum, [, count]) => sum + count, 0);
	const axisSummary = AXIS_NAMES.map(
		(axis) =>
			`${axis}: ${commentOwnerKinds[axis].moved} moved; excluded ${commentOwnerKinds[axis].missing} missing comments, ${commentOwnerKinds[axis].extra} actual-only comments, and ${missingCommentOwnerNodes[axis]} differences whose expected-owner node is absent`
	).join('; ');
	console.log(
		`[parse-ast] ${commentOwnerMovementTotal} comment-owner movements between aligned nodes (${axisSummary}):`
	);
	for (const [key, count] of transitions.slice(0, 50)) {
		console.log(
			`[parse-ast]   ${String(count).padStart(6)}  ${key}   e.g. ${firstCommentOwnerExample.get(key)}`
		);
	}
	if (transitions.length > 50) {
		console.log(`[parse-ast]   ... ${transitions.length - 50} more owner transitions`);
	}
}

if (REPORT_ONLY) process.exit(0);

if (COMMENT_OWNERS && commentOwnerMovementTotal > 0) {
	fail(
		`${commentOwnerMovementTotal} comments moved between aligned owner nodes; the field-level ratchet cannot distinguish this regression from an already-listed comment-attachment key`
	);
}

if (!FILTER && compared.modern < MIN_COMPONENTS) {
	fail(
		`only ${compared.modern} modern-axis pairs compared (expected >= ${MIN_COMPONENTS}) — a verdict from this run would be measured on a population the ratchet does not cover`
	);
}

if (UPDATE) {
	refuseUnrepresentativeBaseline('parse-ast', [
		// Only on the rewrite: the CI job stages the binding with a plain `cp` and
		// writes no provenance stamp, so demanding one on every run would fail a
		// gate that is measuring exactly the right binary. A BASELINE, though, is a
		// durable claim about a tree and must name the tree it was measured on.
		unattributedBindingReason(ROOT),
		FILTER && `--filter ${FILTER} narrows the population; the rewrite would delete every key outside it`,
		compared.modern < MIN_COMPONENTS &&
			`only ${compared.modern} modern-axis pairs compared (need >= ${MIN_COMPONENTS})`,
	]);
	const next = {};
	for (const key of [...observed.keys()].sort()) next[key] = clusterOf(key);
	fs.writeFileSync(RATCHET, JSON.stringify(next, null, '\t') + '\n');
	console.log(`[parse-ast] wrote ${Object.keys(next).length} keys to ${path.relative(ROOT, RATCHET)}`);
	process.exit(0);
}

const baseline = fs.existsSync(RATCHET) ? JSON.parse(fs.readFileSync(RATCHET, 'utf8')) : {};
const problems = [];
for (const [key, count] of sorted) {
	if (!Object.hasOwn(baseline, key)) {
		problems.push(`NEW divergence (${count} entries): ${key}\n    e.g. ${firstExample.get(key)}`);
	} else if (baseline[key] !== clusterOf(key)) {
		problems.push(`cluster label drifted for ${key}: ${baseline[key]} -> ${clusterOf(key)}`);
	}
}
for (const key of Object.keys(baseline)) {
	if (!observed.has(key)) {
		problems.push(
			`listed key no longer diverges: ${key}\n    re-baseline in the same PR: node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline`
		);
	}
}

if (problems.length > 0) {
	console.error(`\n[parse-ast] ${problems.length} ratchet violation(s):`);
	for (const p of problems) console.error(`  - ${p}`);
	process.exit(1);
}

console.log(`[parse-ast] OK — ${Object.keys(baseline).length} listed divergence keys, none new, none stale`);
