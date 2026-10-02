import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_ternary_resolve_fragment01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : '#section';
		const fragment = '#section';

		$$renderer.push(`<a${$.attr('href', condition ? resolve('/foo') : '#section')}>Click me!</a> <a${$.attr('href', condition ? '#section' : resolve('/foo'))}>Click me!</a> <a${$.attr('href', condition ? '#section' : '#other')}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? resolve('/foo') : fragment)}>Click me!</a>`);
	});
}