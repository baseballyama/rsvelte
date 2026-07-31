// The #1944 shape recurring for `load` specifically (#2055): a parenthesized,
// already-typed arrow-const initializer must be left untouched entirely —
// augmenting it again would either double-annotate the parameter or (before
// this fix) wrap the whole thing in a spurious `satisfies`.
export const load = (async (event: import('./$types.js').LayoutLoadEvent) => {
	return { slug: event.params.slug };
});
