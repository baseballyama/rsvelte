import * as $ from 'svelte/internal/server';

export default function Ts_$$slots01_input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots;
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}