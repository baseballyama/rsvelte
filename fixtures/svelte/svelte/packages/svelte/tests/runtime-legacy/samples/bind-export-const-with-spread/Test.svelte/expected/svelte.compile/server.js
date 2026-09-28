import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	const x = 42;

	$.bind_props($$props, { x });
}