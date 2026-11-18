export function f(load, g) {
	const a = /** @type {number} */ (g);
	const c = /** @type {T} */ (load());
	return [a, c];
}
