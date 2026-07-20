// Coordinate mapping between rsvelte's whole-file diagnostics and the
// per-`<script>` coordinate space oxlint interprets `context.report({ loc })`
// in for a `.svelte` file.
//
// Established empirically against oxlint 1.64: when linting a `.svelte` file,
// oxlint only exposes the extracted `<script>` block to a plugin —
// `context.sourceCode.text` is that block's content, offsets/locs are relative
// to it, and oxlint maps a reported loc back to the block's real position in the
// file for display. A diagnostic outside every `<script>` block (markup, style,
// or a scriptless file) therefore has no representable loc; we surface those at
// the top of the block with the real line/column carried in the message.

const SCRIPT_OPEN = /<script\b[^>]*>/giu;

/**
 * Offsets (into the full source) of every `<script>...</script>` block's inner
 * content — the substring oxlint hands a plugin as `sourceCode.text`.
 *
 * @param {string} source
 * @returns {Array<{ start: number, end: number }>}
 */
export function scriptContentRanges(source) {
	const ranges = [];
	SCRIPT_OPEN.lastIndex = 0;
	let match;
	while ((match = SCRIPT_OPEN.exec(source)) !== null) {
		const contentStart = match.index + match[0].length;
		const closeStart = source.indexOf('</script', contentStart);
		if (closeStart === -1) break;
		ranges.push({ start: contentStart, end: closeStart });
		SCRIPT_OPEN.lastIndex = closeStart;
	}
	return ranges;
}

/**
 * Precomputed newline offsets, for O(log n) offset ↔ line/column conversion.
 *
 * @param {string} source
 * @returns {number[]} Offset of the first character of each line.
 */
export function lineStarts(source) {
	const starts = [0];
	for (let i = 0; i < source.length; i += 1) {
		if (source.charCodeAt(i) === 10) starts.push(i + 1);
	}
	return starts;
}

/**
 * Convert a 1-indexed line / 0-indexed column pair into a source offset.
 *
 * @param {number[]} starts
 * @param {number} line 1-indexed.
 * @param {number} column 0-indexed.
 * @returns {number}
 */
export function offsetOf(starts, line, column) {
	const base = starts[Math.min(Math.max(line, 1), starts.length) - 1] ?? 0;
	return base + column;
}

/**
 * Convert a source offset into a 1-indexed line / 0-indexed column pair.
 *
 * @param {number[]} starts
 * @param {number} offset
 * @returns {{ line: number, column: number }}
 */
export function lineColumnOf(starts, offset) {
	let lo = 0;
	let hi = starts.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (starts[mid] <= offset) lo = mid + 1;
		else hi = mid - 1;
	}
	const lineIndex = Math.max(0, lo - 1);
	return { line: lineIndex + 1, column: offset - starts[lineIndex] };
}
