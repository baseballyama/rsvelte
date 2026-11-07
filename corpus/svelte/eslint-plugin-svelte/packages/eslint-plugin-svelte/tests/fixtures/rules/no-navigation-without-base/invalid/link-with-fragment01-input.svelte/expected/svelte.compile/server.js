import * as $ from 'svelte/internal/server';

export default function Link_with_fragment01_input($$renderer) {
	const value = "/foo#section";

	$$renderer.push(`<a href="/foo#section">Click me!</a> <a href="/foo#section">Click me!</a> <a${$.attr('href', '/' + 'foo#section')}>Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a href="/foo#section:42">Click me!</a>`);
}