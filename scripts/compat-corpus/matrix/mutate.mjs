/**
 * Semantics-preserving source mutations, shared by the generated shape matrix
 * (#2281 Gate 2) and the corpus-seeded fuzz (Gate 3).
 *
 * A comment is the one token that may appear between any two other tokens, so
 * any code path that finds a terminator by scanning bytes instead of lexing
 * breaks when one is inserted. #2253 was five such scans in one file.
 *
 * Insertion is restricted to `<script>` regions (and the whole file for
 * `.svelte.js`/`.svelte.ts`), where a JS comment is genuinely inert. In
 * template markup `// x` is literal text: still a valid differential input, but
 * a divergence there says nothing about comment handling, so it would only
 * dilute the signal.
 */

const SCRIPT_OPEN = /<script\b[^>]*>/gi;

/**
 * Byte ranges of every `<script>` body. For a module source (no markup) the
 * whole file is one range.
 */
export function scriptRanges(source, { moduleSource = false } = {}) {
	if (moduleSource) return [{ start: 0, end: source.length }];
	const ranges = [];
	SCRIPT_OPEN.lastIndex = 0;
	for (let m = SCRIPT_OPEN.exec(source); m; m = SCRIPT_OPEN.exec(source)) {
		const start = m.index + m[0].length;
		const end = source.indexOf('</script>', start);
		if (end === -1) break;
		ranges.push({ start, end });
		SCRIPT_OPEN.lastIndex = end;
	}
	return ranges;
}

/**
 * Every line-start offset that falls strictly inside a script range, paired
 * with the indentation of that line so the inserted comment does not also
 * change indentation (which would make every mutant a formatting diff).
 */
export function insertionSlots(source, options) {
	const ranges = scriptRanges(source, options);
	if (ranges.length === 0) return [];
	const slots = [];
	let offset = 0;
	let line = 1;
	for (const text of source.split('\n')) {
		const inRange = ranges.some((r) => offset > r.start && offset <= r.end);
		if (inRange) slots.push({ offset, line, indent: text.match(/^[\t ]*/)[0] });
		offset += text.length + 1;
		line += 1;
	}
	return slots;
}

/**
 * One mutant per (slot × comment kind). The comment goes on its own line so it
 * cannot merge with adjacent code, which keeps the mutation semantics-preserving
 * for every kind including `//`.
 */
export function commentMutants(source, kinds, options = {}) {
	const out = [];
	for (const slot of insertionSlots(source, options)) {
		for (const [kindName, comment] of Object.entries(kinds)) {
			const mutated = source.slice(0, slot.offset) + slot.indent + comment + '\n' + source.slice(slot.offset);
			out.push({ line: slot.line, kind: kindName, source: mutated });
		}
	}
	return out;
}
