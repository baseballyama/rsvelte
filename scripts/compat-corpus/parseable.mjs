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
 * `null` when `code` parses, otherwise a one-line reason including the position
 * acorn reported. Never throws: a parser crash is reported as a failure rather
 * than taking the run down.
 */
export function parseFailure(code) {
	try {
		Parser.parse(code, OPTIONS);
		return null;
	} catch (e) {
		const at = e?.loc ? ` (${e.loc.line}:${e.loc.column})` : '';
		// acorn already appends `(line:col)`; only add one when it did not.
		const message = String(e?.message ?? e);
		return message.includes('(') ? message : message + at;
	}
}
