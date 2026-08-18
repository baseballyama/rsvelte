import { SvelteSet } from 'svelte/reactivity';

export function makeStore() {
	let s = $state(new SvelteSet());
	return () => s;
}
