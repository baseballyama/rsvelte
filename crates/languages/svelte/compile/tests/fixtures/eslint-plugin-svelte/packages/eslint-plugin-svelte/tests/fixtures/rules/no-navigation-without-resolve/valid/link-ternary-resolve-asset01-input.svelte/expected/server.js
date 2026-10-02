import * as $ from 'svelte/internal/server';
import { resolve, asset } from '$app/paths';

export default function Link_ternary_resolve_asset01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : asset('/bar');
		const assetUrl = asset('/bar');

		$$renderer.push(`<a${$.attr('href', condition ? resolve('/foo') : asset('/bar'))}>Click me!</a> <a${$.attr('href', condition ? asset('/bar') : resolve('/foo'))}>Click me!</a> <a${$.attr('href', condition ? asset('/foo') : asset('/bar'))}>Click me!</a> <a${$.attr('href', url)}>Click me!</a> <a${$.attr('href', condition ? resolve('/foo') : assetUrl)}>Click me!</a>`);
	});
}