/**
 * Source-map decoding and structural validation for the svelte2tsx corpus gate.
 *
 * Comparing rsvelte's `mappings` against official svelte2tsx's is not an option.
 * Both are hires, but magic-string segments its output differently — extra
 * chunk-boundary segments, no trailing empty generated lines, different run
 * splits at edit boundaries — so the two disagree entry-for-entry, including on
 * what `originalPositionFor` answers at a given generated position. A byte gate,
 * a decoded-set gate and a lookup-equality gate all diverge on ~100% of the
 * corpus and would ratchet nothing.
 *
 * This module therefore does NOT establish that the two maps agree. It checks
 * that rsvelte's map is internally well-formed against the text it describes,
 * using the official map only to CALIBRATE the invariants: a rule magic-string
 * itself violates is by definition too strict and is not encoded here. Both
 * sides are clean on all 13,465 corpus components that produce a map; see
 * compatibility/svelte2tsx-map-known-failures.md.
 */

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// How many consecutive original columns may share one generated column before
// the run is treated as a stalled copy (see `copy-run-stalled` below). Two is
// legitimate — the closing boundary of one chunk and the opening boundary of the
// next meet at a single generated column when the text between them is deleted.
// A third means the generated column stopped advancing across copied text.
const STALL_RUN_LIMIT = 3;

/**
 * Split one comma-free segment into its VLQ fields. Accumulation is arithmetic
 * rather than bitwise: JS bit operators truncate to int32, which would silently
 * corrupt any field past 2^30 instead of reporting the corruption.
 */
function decodeSegment(segment) {
	const fields = [];
	let value = 0;
	let shift = 0;
	for (const char of segment) {
		const digit = BASE64.indexOf(char);
		if (digit === -1) return null;
		value += (digit % 32) * 2 ** shift;
		if (digit >= 32) {
			shift += 5;
		} else {
			const negative = value % 2 === 1;
			value = (value - (negative ? 1 : 0)) / 2;
			fields.push(negative ? -value : value);
			value = 0;
			shift = 0;
		}
	}
	return shift === 0 ? fields : null;
}

/**
 * Decode a v3 `mappings` string into per-generated-line arrays of ABSOLUTE
 * `[generatedColumn, source, originalLine, originalColumn]` — the view a
 * source-map consumer sees. Returns null if the string is not decodable.
 */
export function decodeMappings(mappings) {
	let source = 0;
	let originalLine = 0;
	let originalColumn = 0;
	const lines = [];
	for (const line of mappings.split(';')) {
		let generatedColumn = 0;
		const segments = [];
		for (const segment of line.split(',')) {
			if (segment === '') continue;
			const fields = decodeSegment(segment);
			// Only 1-field (generated-column-only) and 4-field segments occur here;
			// svelte2tsx never emits `names`, so a 5-field segment is corruption.
			if (fields === null || (fields.length !== 1 && fields.length !== 4)) return null;
			generatedColumn += fields[0];
			if (fields.length === 4) {
				source += fields[1];
				originalLine += fields[2];
				originalColumn += fields[3];
				segments.push([generatedColumn, source, originalLine, originalColumn]);
			}
		}
		lines.push(segments);
	}
	return lines;
}

/** UTF-16 length of each line — the unit source-map columns are counted in. */
export function utf16LineLengths(text) {
	return text.split('\n').map((line) => {
		let units = 0;
		for (const char of line) units += char.codePointAt(0) > 0xffff ? 2 : 1;
		return units;
	});
}

/**
 * Structural violations of `mappings` against the texts it relates, where
 * `generatedLengths` is the UTF-16 length of each generated line (stored at
 * compile time — the generated file itself is later rewritten by oxfmt).
 * Returns an array of `{ kind, detail }`; empty means the map is well-formed.
 */
export function mappingViolations(mappings, generatedLengths, original) {
	const lines = decodeMappings(mappings);
	if (lines === null) return [{ kind: 'undecodable', detail: 'mappings is not valid VLQ' }];

	const found = [];
	const add = (kind, detail) => {
		if (found.length < 5) found.push({ kind, detail });
	};

	const originalLengths = utf16LineLengths(original);

	if (lines.length > generatedLengths.length) {
		add('extra-mapping-lines', `${lines.length} mapping lines > ${generatedLengths.length} generated lines`);
	}

	for (let generatedLine = 0; generatedLine < lines.length; generatedLine++) {
		let previous = null;
		let stalled = 1;
		for (const segment of lines[generatedLine]) {
			const [column, , originalLine, originalColumn] = segment;

			if (previous) {
				if (column < previous[0]) {
					add('columns-not-sorted', `line ${generatedLine}: column ${column} after ${previous[0]}`);
					stalled = 1;
				} else if (column === previous[0] && originalLine === previous[2] && originalColumn === previous[3] + 1) {
					stalled++;
					if (stalled === STALL_RUN_LIMIT) {
						add(
							'copy-run-stalled',
							`line ${generatedLine}: column ${column} maps ${stalled} consecutive original columns ending at ${originalLine}:${originalColumn}`
						);
					}
				} else {
					stalled = 1;
				}
			}
			previous = segment;

			const generatedLength = generatedLengths[generatedLine];
			if (generatedLength === undefined || column > generatedLength) {
				add('generated-out-of-bounds', `line ${generatedLine}: column ${column} past line length ${generatedLength}`);
			}
			if (originalLine < 0 || originalLine >= originalLengths.length) {
				add('original-line-out-of-bounds', `line ${generatedLine}: original line ${originalLine}`);
			} else if (originalColumn < 0 || originalColumn > originalLengths[originalLine]) {
				add(
					'original-column-out-of-bounds',
					`line ${generatedLine}: original ${originalLine}:${originalColumn} past line length ${originalLengths[originalLine]}`
				);
			}
		}
	}

	return found;
}
