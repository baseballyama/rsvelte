// svelte-ignore await_reactivity_loss
export async function f() {
	const r = await g();
	return r;
}