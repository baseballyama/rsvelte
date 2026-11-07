import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer, $$props) {
	const { prop1, prop2 } = $$props;
	const zero = 0;
	const derived = $.derived(() => zero * 2);
	const derivedBy = $.derived(calc());
}