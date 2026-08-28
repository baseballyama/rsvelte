/**
 * The output-parseability oracle: "is what the compiler emitted even
 * JavaScript?"
 *
 * Every other comparison in this pipeline is rsvelte's text against official's
 * text, so "wrong text" and "text no parser accepts" produce the same row and
 * the same ratchet entry. This asks a question that needs no reference to
 * official's bytes at all.
 *
 * THE PARSER IS acorn, DELIBERATELY. rsvelte parses JavaScript with OXC, and
 * every existing "does it parse" check in the repo (`ast_equiv_batch`,
 * `tests/ast_gate_preconditions.rs`) re-uses OXC — so an acceptance quirk in the
 * parser rsvelte itself depends on is invisible to all of them. acorn is the
 * parser upstream Svelte uses, is a separate implementation, and is already a
 * root devDependency.
 *
 * Calibration (the reason these exact options and no others): compiling 3,509
 * real-world components from four repositories with the OFFICIAL compiler across
 * all three targets produced 10,464 modules, of which acorn rejected 0 under
 * `OPTIONS` below. Positive control: acorn rejects 30/30 of the rsvelte outputs
 * that esbuild also rejects, so the oracle is not merely permissive.
 */

import { Parser } from 'acorn';

/**
 * `sourceType: 'module'` is what both compilers emit; `ecmaVersion: 'latest'`
 * implies top-level await. `allowHashBang` costs nothing and removes a shebang
 * from the ways this can report a false failure.
 */
export const OPTIONS = { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true };

/**
 * `null` when `code` parses, otherwise a reason including the position and the
 * generated source line acorn rejected. Never throws: a parser crash is
 * reported as a failure rather than taking the run down.
 */
export function parseFailure(code) {
	try {
		Parser.parse(code, OPTIONS);
		return null;
	} catch (e) {
		const at = e?.loc ? ` (${e.loc.line}:${e.loc.column})` : '';
		// acorn already appends `(line:col)`; only add one when it did not.
		const message = String(e?.message ?? e);
		const reason = message.includes('(') ? message : message + at;
		if (!e?.loc) return reason;

		const lines = code.split(/\r?\n/);
		let lineIndex = e.loc.line - 1;
		let column = e.loc.column;
		// At EOF Acorn locates the error at column zero of the synthetic blank
		// line after the source. Show the preceding source line and its end so
		// the frame identifies the incomplete construct instead of an empty row.
		if (lines[lineIndex] === '' && column === 0 && lineIndex > 0) {
			lineIndex -= 1;
			column = lines[lineIndex].length;
		}

		const line = lines[lineIndex];
		if (line === undefined) return reason;

		const gutter = String(lineIndex + 1);
		// Acorn's column is zero-based. Expand tabs in the prefix so the caret
		// still points at the rejected token in a terminal or CI log.
		const prefix = line.slice(0, column).replaceAll('\t', '  ');
		const displayedLine = line.replaceAll('\t', '  ');
		return `${reason}\n${gutter} | ${displayedLine}\n${' '.repeat(gutter.length)} | ${' '.repeat(prefix.length)}^`;
	}
}
