/* eslint svelte/no-unnecessary-state-wrap: ["warn", { "allowReassign": true }] */
import { SvelteSet } from 'svelte/reactivity';

let kept = $state(new SvelteSet());
let swapped = $state(new SvelteSet());
export function swap() {
	swapped = new SvelteSet();
}
export function read() {
	return kept.size + swapped.size;
}
