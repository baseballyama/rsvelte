import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_output($$anchor, $$props) {
	const zero = 0;
	const state = 0;
	const raw = 0;
	const doubled = state * 2;
	let derived = $.derived(() => state * 2);
	const calculated = calc();
	let derivedBy = $.derived(calc());
	let noInit;
}