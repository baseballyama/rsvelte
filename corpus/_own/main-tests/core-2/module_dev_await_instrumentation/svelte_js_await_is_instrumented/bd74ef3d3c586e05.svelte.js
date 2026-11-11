export async function load() {
	const r = await fetch("/x");
	return r;
}