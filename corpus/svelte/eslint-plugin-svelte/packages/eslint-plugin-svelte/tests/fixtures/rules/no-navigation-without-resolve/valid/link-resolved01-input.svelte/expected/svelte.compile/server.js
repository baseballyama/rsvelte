import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Link_resolved01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = resolve('/foo/');
		const href = resolve('/foo/');

		$$renderer.push(`<a${$.attr('href', resolve('/foo/'))}>Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a> <input type="text" disabled=""/>`);
	});
}