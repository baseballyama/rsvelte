import * as $ from 'svelte/internal/server';

export default function Foo($$renderer) {
	$$renderer.push(`<p>mjs</p>`);
}