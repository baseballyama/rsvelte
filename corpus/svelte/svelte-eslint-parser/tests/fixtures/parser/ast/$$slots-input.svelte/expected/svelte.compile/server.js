import * as $ from 'svelte/internal/server';

export default function $$slots_input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	if ($$slots.labelText) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}