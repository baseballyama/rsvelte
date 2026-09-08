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
 * Pair two sibling lists so that ONE dropped node costs one key.
 *
 * Identity alone is not the alignment. An identity built from `(type, start,
 * end)` de-pairs a node whose span or type is merely WRONG, and those are the
 * two largest divergence classes here — so aligning on identity alone converts
 * a `#span` into a phantom delete-plus-insert and a mislabel into two keys
 * where the walk already reports one. Measured over the corpus, that traded 7
 * `#span` and 5 `.type#value` keys for node-level pairs that describe the
 * defect less accurately than the index pairing being replaced.
 *
 * So identity is used only to find ANCHORS — ids occurring exactly once on
 * each side — and the runs between consecutive anchors are paired by index,
 * which is what the comparator did before. A drop consumes one slot of one gap
 * and every later sibling re-anchors, while a wrong span or a mislabel stays
 * inside a gap and is compared exactly as it used to be. The alignment can
 * therefore only remove keys the old pairing invented; it cannot lose one.
 *
 * `(type, start, end)` is NOT unique: upstream's acorn-typescript comment
 * doubling puts two comments with the identical span in one array. Such an id
 * is not unique on either side, so it is never an anchor and its occurrences
 * are index-paired — which keeps a deletion of one of the two visible, where a
 * map keyed on the triple would collapse the pair and report nothing.
 *
 * Returns `null` when either side holds an element with no identity, so arrays
 * of strings, numbers and typeless objects keep index pairing.
 */
export function alignSiblings(a, b) {
	const ids = (list) => {
		const out = [];
		for (const item of list) {
			const id = idOf(item);
			if (id === null) return null;
			out.push(id);
		}
		return out;
	};
	const ia = ids(a);
	if (ia === null) return null;
	const ib = ids(b);
	if (ib === null) return null;

	/** id → its only index, or `null` once a second occurrence is seen. */
	const uniqueIndex = (list) => {
		const seen = new Map();
		list.forEach((id, i) => seen.set(id, seen.has(id) ? null : i));
		return seen;
	};
	const ua = uniqueIndex(ia);
	const ub = uniqueIndex(ib);

	const anchors = [];
	for (let i = 0; i < ia.length; i++) {
		if (ua.get(ia[i]) !== i) continue;
		const j = ub.get(ia[i]);
		if (j === null || j === undefined) continue;
		anchors.push([i, j]);
	}

	// Anchors are collected in ascending `a` order, so a partner sequence that
	// is not increasing means the two sides disagree about order.
	let reordered = false;
	for (let k = 1; k < anchors.length; k++) {
		if (anchors[k][1] <= anchors[k - 1][1]) {
			reordered = true;
			break;
		}
	}

	// A reorder leaves "the run between two anchors" undefined on `b`'s side, so
	// gap pairing is not available: pair the anchors themselves and report the
	// rest. `#order` is the finding in that case, and it is rare.
	if (reordered) {
		const matchedA = new Set(anchors.map(([i]) => i));
		const matchedB = new Set(anchors.map(([, j]) => j));
		return {
			pairs: anchors,
			onlyA: a.map((_, i) => i).filter((i) => !matchedA.has(i)),
			onlyB: b.map((_, j) => j).filter((j) => !matchedB.has(j)),
			reordered: true,
		};
	}

	const pairs = [];
	const onlyA = [];
	const onlyB = [];
	let i = 0;
	let j = 0;
	const gap = (endA, endB) => {
		const n = Math.min(endA - i, endB - j);
		for (let k = 0; k < n; k++) pairs.push([i + k, j + k]);
		for (let k = i + n; k < endA; k++) onlyA.push(k);
		for (let k = j + n; k < endB; k++) onlyB.push(k);
		i = endA;
		j = endB;
	};
	for (const [ai, bj] of anchors) {
		gap(ai, bj);
		pairs.push([ai, bj]);
		i = ai + 1;
		j = bj + 1;
	}
	gap(a.length, b.length);

	return { pairs, onlyA, onlyB, reordered: false };
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
		// Pure index pairing turns ONE dropped node into a spray: every following
		// sibling is compared against the wrong partner, and each mismatch is
		// filed under its own key naming a node type the defect never touched.
		const aligned = alignSiblings(a, b);
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
