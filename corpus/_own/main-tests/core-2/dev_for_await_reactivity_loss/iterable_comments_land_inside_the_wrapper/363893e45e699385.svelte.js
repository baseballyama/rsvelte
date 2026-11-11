export async function f(xs, use) {
	for await (const x /* c */ of xs) {}
	after();
}
