import * as $ from 'svelte/internal/server';

export default function Await_input($$renderer) {
	let foo;

	$.await($$renderer, foo, () => {}, (bar) => {
		$$renderer.push(`<button></button>`);
	});

	$$renderer.push(`<!--]-->`);
}