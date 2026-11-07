import * as $ from 'svelte/internal/server';

export default function Ts_slot_binding01_input_child($$renderer, $$props) {
	let foo = { prop: true };

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { foo }, null);
	$$renderer.push(`<!--]-->`);
}