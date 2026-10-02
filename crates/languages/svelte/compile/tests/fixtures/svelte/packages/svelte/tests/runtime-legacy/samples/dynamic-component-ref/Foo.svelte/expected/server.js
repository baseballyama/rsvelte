import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	const test = true;

	$$renderer.push(`<!---->Foo`);
	$.bind_props($$props, { test });
}