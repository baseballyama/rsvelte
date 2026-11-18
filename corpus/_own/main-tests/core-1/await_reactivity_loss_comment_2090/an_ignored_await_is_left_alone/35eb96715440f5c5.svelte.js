export async function f() {
	// svelte-ignore await_reactivity_loss
	return await /* hi */ load();
}
