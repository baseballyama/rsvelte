import * as $ from 'svelte/internal/server';

export default function Unknown_directive01_input($$renderer) {
	let foo = false;
	let bar = false;

	$$renderer.push(`<div${$.attr('foo:bar', bar)}></div> <div bar:foo=""></div>`);
}