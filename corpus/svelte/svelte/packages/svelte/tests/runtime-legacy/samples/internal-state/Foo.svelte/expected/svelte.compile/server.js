import * as $ from 'svelte/internal/server';

export default function Foo($$renderer) {
	let internal = 1;

	$$renderer.push(`<p>internal: 1</p>`);
}