import * as $ from 'svelte/internal/server';

export default function Props04_input($$renderer, $$props) {
	let prop;

	$.bind_props($$props, { prop });
}