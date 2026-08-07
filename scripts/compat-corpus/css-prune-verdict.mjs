/**
 * Comparator for the CSS-prune differential sweep.
 *
 * Split out of css-prune-sweep.mjs so it can be exercised without the NAPI
 * binding the sweep loads at import time — a comparator that silently stops
 * looking at a field is the failure this module's self-test exists to catch.
 */

// Collapse the scope-hash value (not its placement) so a diff isolates the
// prune decision, not any hash-algorithm drift.
export const normHash = (css) => (css ?? '').replace(/svelte-[0-9a-z]+/g, 'svelte-X');

export const warningKeys = (r) =>
	(r.warnings ?? [])
		.map((w) => `${w.code}@${w.start?.line ?? '?'}:${w.start?.column ?? '?'}`)
		.sort();

/**
 * @param {{ css?: string, warnings?: string[], error?: { code: string, message: string } }} e official
 * @param {{ css?: string, warnings?: string[], error?: { code: string, message: string } }} a rsvelte
 * @returns {string} a verdict starting with `match` when the two agree
 */
export function verdictOf(e, a) {
	if (e.error && a.error)
		return e.error.code === a.error.code
			? 'match (error parity)'
			: `error-mismatch (official ${e.error.code} / rsvelte ${a.error.code})`;
	if (e.error && !a.error) return `error-mismatch (official errors ${e.error.code}, rsvelte compiles)`;
	if (!e.error && a.error) return `error-mismatch (rsvelte errors ${a.error.code}, official compiles)`;
	if (e.css !== a.css) return 'css-mismatch';
	// `css_unused_selector` states the prune decision directly, so a warning-only
	// divergence is a prune divergence the emitted CSS happens not to show.
	const ew = e.warnings ?? [];
	const aw = a.warnings ?? [];
	if (ew.length !== aw.length || ew.some((w, i) => w !== aw[i])) return 'warning-mismatch';
	return 'match';
}
