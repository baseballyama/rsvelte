import * as $ from 'svelte/internal/server';
import { asset as alias } from '$app/paths';

export default function Link_asset_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a${$.attr('href', alias('/foo/'))}>Click me!</a>;`);
	});
}