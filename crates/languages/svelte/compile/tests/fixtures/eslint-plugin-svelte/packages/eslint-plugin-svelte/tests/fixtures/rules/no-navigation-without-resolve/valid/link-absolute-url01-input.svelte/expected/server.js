import * as $ from 'svelte/internal/server';

export default function Link_absolute_url01_input($$renderer) {
	const protocol = 'https';
	const value = "https://svelte.dev";
	const href = "https://svelte.dev";

	$$renderer.push(`<a href="http://svelte.dev">Click me!</a> <a href="https://svelte.dev">Click me!</a> <a href="http://svelte.dev">Click me!</a> <a href="https://svelte.dev">Click me!</a> <a${$.attr('href', 'http://svelte' + '.dev')}>Click me!</a> <a${$.attr('href', 'https://svelte' + '.dev')}>Click me!</a> <a${$.attr('href', 'http' + '://svelte.dev')}>Click me!</a> <a${$.attr('href', 'https' + '://svelte.dev')}>Click me!</a> <a${$.attr('href', `${protocol}://svelte.dev`)}>Click me!</a> <a href="mailto:user@example.com">Click me!</a> <a href="tel:+123456789">Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a>`);
}