import * as $ from 'svelte/internal/server';

export default function Link_ternary_absolute_fragment01_input($$renderer) {
	const condition = true;
	const url = condition ? 'https://example.com' : '#section';
	const absUrl = 'https://example.com';

	$$renderer.push(`<a${$.attr('href', condition ? 'https://example.com' : '#section')}>Click me!</a> <a${$.attr('href', condition ? '#section' : null)}>Click me!</a> <a${$.attr('href', condition ? 'https://example.com' : null)}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? absUrl : '#section')}>Click me!</a>`);
}