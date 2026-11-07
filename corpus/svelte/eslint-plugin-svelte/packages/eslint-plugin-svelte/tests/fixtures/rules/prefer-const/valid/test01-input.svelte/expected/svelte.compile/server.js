import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer, $$props) {
	let { prop1, prop2 } = $$props;
	const zero = 0;
	let derived = $.derived(() => zero * 2);
	let derivedBy = $.derived(calc());
}