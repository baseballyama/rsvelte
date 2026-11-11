export async function f() {
	// svelte-ignore state_referenced_locally
	const r = await g();
	return r;
}