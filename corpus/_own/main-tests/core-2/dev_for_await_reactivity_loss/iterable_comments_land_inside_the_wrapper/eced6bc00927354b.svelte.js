export async function f(xs, use) {
	for await (const x of xs) use(x); // tail
	after();
}
