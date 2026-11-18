export async function f() {
	// svelte-ignore await_reactivity_loss
	return (/* c */ await load())();
}
