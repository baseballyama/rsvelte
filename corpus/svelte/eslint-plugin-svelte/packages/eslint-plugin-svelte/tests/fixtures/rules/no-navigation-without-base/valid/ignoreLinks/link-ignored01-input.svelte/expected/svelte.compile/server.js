import * as $ from 'svelte/internal/server';

export default function Link_ignored01_input($$renderer) {
	$$renderer.push(`<a href="/foo">Click me!</a> <a href="/foo">Click me!</a> <a${$.attr('href', '/' + 'foo')}>Click me!</a>`);
}