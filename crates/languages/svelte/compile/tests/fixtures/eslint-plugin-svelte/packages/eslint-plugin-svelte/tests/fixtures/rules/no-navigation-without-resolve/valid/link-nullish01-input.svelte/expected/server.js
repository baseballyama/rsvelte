import * as $ from 'svelte/internal/server';

export default function Link_nullish01_input($$renderer) {
	const one = undefined;
	const two = null;
	const href = null;

	$$renderer.push(`<a${$.attr('href', undefined)}>Click me!</a> <a${$.attr('href', null)}>Click me!</a> <a${$.attr('href', one)}>Click me!</a> <a${$.attr('href', two)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a>`);
}