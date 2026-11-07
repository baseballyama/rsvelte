import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	const a = {};

	$$renderer.push(`<div>Hello world</div>`);
	$.bind_props($$props, { a });
}