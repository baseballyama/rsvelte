import * as $ from 'svelte/internal/server';

export default function Ts_$$slots03_named_type_output($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots; // $$slots: Record<"foo", boolean>
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]-->`);
}