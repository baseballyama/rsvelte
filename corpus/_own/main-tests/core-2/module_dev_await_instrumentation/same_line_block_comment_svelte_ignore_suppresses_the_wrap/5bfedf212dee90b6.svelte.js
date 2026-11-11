export async function f() {
	/* svelte-ignore await_reactivity_loss */ const r = await g();
	return r;
}