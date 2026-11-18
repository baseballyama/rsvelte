export async function f() {
	/* svelte-ignore await_reactivity_loss, other */
	const r = await g();
	return r;
}