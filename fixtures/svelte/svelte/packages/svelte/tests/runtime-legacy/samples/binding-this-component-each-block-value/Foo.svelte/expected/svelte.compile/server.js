import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	const test = true;

	$$renderer.push(`<div>foo</div>`);
	$.bind_props($$props, { test });
}