import * as $ from 'svelte/internal/server';

export default function Link_fragment_url_invalid_operator01_input($$renderer) {
	$$renderer.push(`<a${$.attr('href', '#section' - '/foo')}>Click me!</a> <a${$.attr('href', '#section' * '/foo')}>Click me!</a>`);
}