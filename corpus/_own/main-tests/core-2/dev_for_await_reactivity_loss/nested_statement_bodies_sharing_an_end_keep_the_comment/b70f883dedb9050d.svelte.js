export async function f(xs, use) {
	for await (const x of xs) for await (const y of /* i */ x) use(y); // t
}
