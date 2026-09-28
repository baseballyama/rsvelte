import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h2>${$.escape(page.url.pathname)}</h2> <a data-testid="child"${$.attr('href', resolve('/slash/child'))}>/slash/child</a>`);
	});
}