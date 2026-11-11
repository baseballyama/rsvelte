export async function f(xs, use) {
	for await (const x of xs) { // first
		use(x);
	}
	after();
}
