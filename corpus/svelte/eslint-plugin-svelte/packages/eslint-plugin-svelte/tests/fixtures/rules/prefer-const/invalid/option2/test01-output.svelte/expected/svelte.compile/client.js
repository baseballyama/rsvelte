import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_output($$anchor, $$props) {
	let zero = 0;
	const derived = $.derived(() => zero * 2);
	const derivedBy = $.derived(calc());
}