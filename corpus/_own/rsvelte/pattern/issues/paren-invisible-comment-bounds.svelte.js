// acorn elides parentheses, so a `(` is neither a node a comment can lead nor a
// bound for the flush that prints it. Both halves have to hold at once: the cast
// comment below crosses the cast's parens into the dev `track_reactivity_loss`
// wrapper, while `f(` — the same byte, opening a node that starts at `f` — stops
// the run. The second cast pins the bound: its operand is one line down, so the
// comment keeps a line break that a `(`-bounded flush turns into a space.
export async function f(load, g) {
	const r = /** @type {R} */ (await load());

	const s = g/* keep */(await load());

	return /** @type {T} */ (
		r + s
	);
}
