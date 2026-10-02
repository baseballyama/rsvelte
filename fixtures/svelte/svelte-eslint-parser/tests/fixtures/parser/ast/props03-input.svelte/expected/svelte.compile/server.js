import * as $ from 'svelte/internal/server';

export default function Props03_input($$renderer, $$props) {
	let prop;

	$.bind_props($$props, { x: prop });
}