import * as $ from 'svelte/internal/server';
import { asset } from '$app/paths';

export default function Link_ternary_asset_plain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		$$renderer.push(`<a${$.attr('href', condition ? asset('/foo') : '/bar')}>Click me!</a> <a${$.attr('href', condition ? '/foo' : asset('/bar'))}>Click me!</a>`);
	});
}