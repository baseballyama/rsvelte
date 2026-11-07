import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_ternary_resolve_nullish01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : null;
		const nullish = null;

		$$renderer.push(`<a${$.attr('href', condition ? resolve('/foo') : null)}>Click me!</a> <a${$.attr('href', condition ? null : resolve('/foo'))}>Click me!</a> <a${$.attr('href', condition ? null : undefined)}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? resolve('/foo') : nullish)}>Click me!</a>`);
	});
}