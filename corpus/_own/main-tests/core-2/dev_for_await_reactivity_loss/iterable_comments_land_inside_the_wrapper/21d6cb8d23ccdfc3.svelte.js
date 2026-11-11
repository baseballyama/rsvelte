export async function f(xs, use) {
	for await (const x of /** @type {any} */ (xs)) {}
	after();
}
