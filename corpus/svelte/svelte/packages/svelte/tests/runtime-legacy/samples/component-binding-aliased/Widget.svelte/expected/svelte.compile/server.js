import * as $ from 'svelte/internal/server';

export default function Widget($$renderer, $$props) {
	let foo = 42;

	$.bind_props($$props, { bar: foo });
}