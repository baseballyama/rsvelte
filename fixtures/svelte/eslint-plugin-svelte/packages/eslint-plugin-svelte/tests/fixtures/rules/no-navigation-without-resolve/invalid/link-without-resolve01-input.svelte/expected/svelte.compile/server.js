import * as $ from 'svelte/internal/server';

export default function Link_without_resolve01_input($$renderer) {
	const value = "/foo";
	const href = "/foo";

	$$renderer.push(`<a href="/foo">Click me!</a> <a href="/foo">Click me!</a> <a${$.attr('href', '/' + 'foo')}>Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a> <a href="/user:42">Click me!</a>`);
}