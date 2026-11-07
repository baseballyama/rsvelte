import * as $ from 'svelte/internal/server';

export default function Slot($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	if ($$slots) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}