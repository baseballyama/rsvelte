import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_ternary_resolve_plain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : '/bar';
		const plain = '/bar';

		$$renderer.push(`<a${$.attr('href', condition ? resolve('/foo') : '/bar')}>Click me!</a> <a${$.attr('href', condition ? '/foo' : resolve('/bar'))}>Click me!</a> <a${$.attr('href', condition ? '/foo' : '/bar')}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? resolve('/foo') : plain)}>Click me!</a>`);
	});
}