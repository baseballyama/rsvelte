import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer, $$props) {
	let { prop1, prop2 } = $$props;
	let zero = 0;
	let state = 0;
	let raw = 0;
	let doubled = state * 2;
	let derived = $.derived(() => state * 2);
	let calculated = calc();
	let derivedBy = $.derived(calc());
	let noInit;
}