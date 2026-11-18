export async function run() {
	// svelte-ignore await_reactivity_loss
	for await (const x of gen()) {
		use(x);
	}
}
