import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a id="resolved-link"${$.attr('href', resolve('/resolve-relative/lv1'))}>go up</a>`);
	});
}