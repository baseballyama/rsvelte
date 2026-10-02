import * as $ from 'svelte/internal/server';

export default function Ts_$$slots01_type_output($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots; // $$slots: Record<"default", boolean>
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}