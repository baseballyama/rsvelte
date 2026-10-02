import * as $ from 'svelte/internal/server';

export default function Link_nullish_like_literal01_input($$renderer) {
	const one = "undefined";
	const two = "null";

	$$renderer.push(`<a href="undefined">Click me!</a> <a href="null">Click me!</a> <a${$.attr('href', one)}>Click me!</a> <a${$.attr('href', two)}>Click me!</a> <a${$.attr('href', `undefined`)}>Click me!</a> <a${$.attr('href', `null`)}>Click me!</a> <a${$.attr('href', `${undefined}`)}>Click me!</a> <a${$.attr('href', `${null}`)}>Click me!</a> <a${$.attr('href', `${one}`)}>Click me!</a> <a${$.attr('href', `${two}`)}>Click me!</a>`);
}