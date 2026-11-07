import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer, $$props) {
	let { prop1, prop2 } = $$props;
	const zero = 0;
	const state = 0;
	const raw = 0;
	const doubled = state * 2;
	let derived = $.derived(() => state * 2);
	const calculated = calc();
	let derivedBy = $.derived(calc());
	let noInit;
}