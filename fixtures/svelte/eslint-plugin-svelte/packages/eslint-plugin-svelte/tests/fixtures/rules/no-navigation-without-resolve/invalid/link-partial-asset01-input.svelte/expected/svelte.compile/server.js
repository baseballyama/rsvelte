import * as $ from 'svelte/internal/server';
import { asset } from '$app/paths';

export default function Link_partial_asset01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a${$.attr('href', asset('/foo') + '/bar')}>Click me!</a> <a${$.attr('href', '/foo' + asset('/bar'))}>Click me!</a>`);
	});
}