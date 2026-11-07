import * as $ from 'svelte/internal/server';

export default function Link_absolute_url_invalid_operator01_input($$renderer) {
	$$renderer.push(`<a${$.attr('href', 'https://example.com' - '/foo')}>Click me!</a> <a${$.attr('href', '/foo' - 'https://example.com')}>Click me!</a> <a${$.attr('href', 'https://' - 'example.com')}>Click me!</a>`);
}