export async function f() {
	const r = /** @type {R} */ (await load());
	return r;
}
