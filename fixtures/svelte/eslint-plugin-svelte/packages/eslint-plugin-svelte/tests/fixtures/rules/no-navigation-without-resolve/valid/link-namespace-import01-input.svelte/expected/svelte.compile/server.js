import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';

export default function Link_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a${$.attr('href', paths.resolve('/foo/'))}>Click me!</a>;`);
	});
}