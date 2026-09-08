/**
 * The `parse()` AST comparator, extracted so it can be exercised directly.
 * `parse-ast-verify.mjs` runs a whole corpus at import time, so a test that
 * wants to state what the comparator does on one pair of trees cannot go
 * through it.
 */

/**
 * Relative paths whose object keys are USER DATA rather than schema — the
 * `<svelte:options customElement={{ props: { … } }} />` bag is keyed by the
 * prop names the component author chose. Descending into them with the key in
 * the path files one defect under as many ratchet entries as the corpus happens
 * to contain distinct names, so a new file carrying a new prop name grows the
 * ratchet for an ALREADY LISTED defect. They collapse to `{}` for the same
 * reason array indices collapse to `[]`; no divergence stops being reported,
 * it is reported once instead of once per name.
 */
export const DATA_KEYED_PATHS = new Set(['Root.options.customElement.props']);

/**
 * A node's identity for sibling alignment: its type and its own source range.
 * `null` for anything not carrying all three, which is the signal to pair that
 * array by index instead.
 */
export function idOf(node) {
	if (node === null || typeof node !== 'object' || Array.isArray(node)) return null;
	if (typeof node.type !== 'string') return null;
	if (typeof node.start !== 'number' || typeof node.end !== 'number') return null;
	return `${node.type} ${node.start} ${node.end}`;
}

/**
 * Pair two sibling lists by identity rather than by index.
 *
 * `(type, start, end)` is NOT unique: upstream's acorn-typescript comment
 * doubling puts two comments with the identical span in one array, so a map
 * keyed on the triple collapses them and a real deletion of one of them reports
 * nothing — identity matching would be LOOSER than the index matching it
 * replaces. Pairing by `(triple, nth occurrence of that triple)` keeps both.
 *
 * Returns `null` when either side holds an element with no identity, so arrays
 * of strings, numbers and typeless objects keep index pairing.
 */
export function alignByIdentity(a, b) {
	const ids = (list) => {
		const seen = new Map();
		const out = [];
		for (const item of list) {
			const id = idOf(item);
			if (id === null) return null;
			const nth = seen.get(id) ?? 0;
			seen.set(id, nth + 1);
			out.push(`${id} ${nth}`);
		}
		return out;
	};
	const ia = ids(a);
	if (ia === null) return null;
	const ib = ids(b);
	if (ib === null) return null;

	const bIndex = new Map();
	for (let i = 0; i < ib.length; i++) bIndex.set(ib[i], i);

	const pairs = [];
	const onlyA = [];
	const matchedB = new Set();
	for (let i = 0; i < ia.length; i++) {
		const j = bIndex.get(ia[i]);
		if (j === undefined) onlyA.push(i);
		else {
			pairs.push([i, j]);
			matchedB.add(j);
		}
	}
	const onlyB = [];
	for (let j = 0; j < b.length; j++) if (!matchedB.has(j)) onlyB.push(j);

	// Matched pairs are collected in ascending `a` order, so a partner sequence
	// that is not increasing is a reorder. Testing the matched subsequence
	// rather than the raw indices is what keeps a deletion from reporting every
	// following sibling as reordered — that would be the spray this change
	// exists to remove, wearing a different key.
	let reordered = false;
	for (let k = 1; k < pairs.length; k++) {
		if (pairs[k][1] <= pairs[k - 1][1]) {
			reordered = true;
			break;
		}
	}
	return { pairs, onlyA, onlyB, reordered };
}

/**
 * Collect the divergence keys of two JSON values. `ctx` is the `type` of the
 * nearest enclosing typed object and `rel` the path since it, so a defect
 * reachable at four nesting depths is one key rather than four.
 *
 * `a` is official's tree and `b` is rsvelte's, so `#missing` means official
 * emitted something rsvelte did not.
 */
export function diffKeys(a, b, out, ctx, rel, depth = 0) {
	if (a === b || depth > 100) return;
	const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
	const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
	if (ta !== tb) {
		out.add(`${ctx}${rel}#type`);
		return;
	}
	if (ta === 'array') {
		if (a.length !== b.length) out.add(`${ctx}${rel}[]#length`);
		// Index pairing turns ONE dropped node into a spray: every following
		// sibling is compared against the wrong partner, and each mismatch is
		// filed under its own key naming a node type the defect never touched.
		const aligned = alignByIdentity(a, b);
		if (aligned === null) {
			const n = Math.min(a.length, b.length);
			for (let i = 0; i < n; i++) diffKeys(a[i], b[i], out, ctx, `${rel}[]`, depth + 1);
			return;
		}
		for (const [i, j] of aligned.pairs) diffKeys(a[i], b[j], out, ctx, `${rel}[]`, depth + 1);
		// An unmatched node is its own key naming the node, so the walk does not
		// become looser than the index pairing it replaces by silently skipping
		// whatever one side omits.
		for (const i of aligned.onlyA) out.add(`${a[i].type}#node-missing`);
		for (const j of aligned.onlyB) out.add(`${b[j].type}#node-extra`);
		if (aligned.reordered) out.add(`${ctx}${rel}[]#order`);
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
		const dataKeyed = DATA_KEYED_PATHS.has(`${ctx}${rel}`);
		for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
			const inA = Object.hasOwn(a, key);
			const inB = Object.hasOwn(b, key);
			// Under a data-keyed path the key is the component author's prop
			// name, so it names an input rather than a defect.
			const step = dataKeyed ? `${rel}{}` : `${rel}.${key}`;
			if (inA && !inB) out.add(`${ctx}${step}#missing`);
			else if (!inA && inB) out.add(`${ctx}${step}#extra`);
			// `start`, `end` and `loc` are one fact — where the node is — derived
			// from the same offsets. Compared field by field they are six keys
			// per node type (`loc.start.line`, `loc.end.column`, …) for a single
			// off-by-one, so a divergence in any of them is one `#span` key.
			// Their PRESENCE stays separate above: a node with no `loc` at all is
			// a different defect from a node whose `loc` is wrong.
			else if (key === 'start' || key === 'end' || key === 'loc') {
				if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) out.add(`${ctx}${rel}#span`);
			} else diffKeys(a[key], b[key], out, ctx, step, depth + 1);
		}
		return;
	}
	out.add(`${ctx}${rel}#value`);
}
