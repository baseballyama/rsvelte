import * as $ from 'svelte/internal/server';

export default function Recursive_loop01_input($$renderer) {
	const a = derived;
	const derived = a;

	$$renderer.push(`<a${$.attr('id', derived)}>Click me!</a>`);
}