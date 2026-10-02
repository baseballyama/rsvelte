import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_ternary_resolve_absolute01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : 'https://example.com';
		const absUrl = 'https://example.com';

		$$renderer.push(`<a${$.attr('href', condition ? resolve('/foo') : 'https://example.com')}>Click me!</a> <a${$.attr('href', condition ? 'https://example.com' : resolve('/foo'))}>Click me!</a> <a${$.attr('href', condition ? 'https://example.com' : 'https://other.com')}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? resolve('/foo') : absUrl)}>Click me!</a>`);
	});
}