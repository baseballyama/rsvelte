export async function f(xs, use) {
	for await (const x of /* it */
		xs) {}
	after();
}
