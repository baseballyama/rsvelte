import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_partial_resolve01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = resolve('/foo') + '/bar';
		const href = resolve('/foo') + '/bar';

		$$renderer.push(`<a${$.attr('href', resolve('/foo') + '/bar')}>Click me!</a> <a${$.attr('href', '/foo' + resolve('/bar'))}>Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a>`);
	});
}