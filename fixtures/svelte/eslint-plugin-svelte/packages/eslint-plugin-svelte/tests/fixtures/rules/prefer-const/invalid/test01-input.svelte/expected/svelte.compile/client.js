import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor, $$props) {
	let zero = 0;
	let state = 0;
	let raw = 0;
	let doubled = state * 2;
	let derived = $.derived(() => state * 2);
	let calculated = calc();
	let derivedBy = $.derived(calc());
	let noInit;
}