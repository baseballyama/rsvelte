export async function f() {
	const r = /* svelte-ignore await_reactivity_loss */ await g();
	return r;
}