import * as $ from 'svelte/internal/server';

export default function Recursive_loop01_input($$renderer) {
	const a = value;
	const value = a;

	$$renderer.push(`<a${$.attr('href', value)}>Click me!</a>`);
}