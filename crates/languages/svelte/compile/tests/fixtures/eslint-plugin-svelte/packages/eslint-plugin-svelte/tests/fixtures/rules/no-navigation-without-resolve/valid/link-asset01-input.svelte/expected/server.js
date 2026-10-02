import * as $ from 'svelte/internal/server';
import { asset } from '$app/paths';

export default function Link_asset01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = asset('/foo/');

		$$renderer.push(`<a${$.attr('href', asset('/foo/'))}>Click me!</a> <a${$.attr('href', value)}>Click me!</a>`);
	});
}