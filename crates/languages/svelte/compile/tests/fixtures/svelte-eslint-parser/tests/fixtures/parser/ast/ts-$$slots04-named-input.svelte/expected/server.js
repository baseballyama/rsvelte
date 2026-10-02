import * as $ from 'svelte/internal/server';

export default function Ts_$$slots04_named_input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots;
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'bar', {}, null);
	$$renderer.push(`<!--]-->`);
}