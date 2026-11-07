import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor, $$props) {
	const zero = 0;
	let derived = $.derived(() => zero * 2);
	let derivedBy = $.derived(calc());
}