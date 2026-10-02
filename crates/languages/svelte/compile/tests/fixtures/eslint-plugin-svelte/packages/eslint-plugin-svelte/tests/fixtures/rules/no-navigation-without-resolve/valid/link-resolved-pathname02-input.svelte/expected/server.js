import * as $ from 'svelte/internal/server';

export default function Link_resolved_pathname02_input($$renderer) {
	const href = '/test';

	$$renderer.push(`<a${$.attr('href', href)}>Click me!</a>`);
}