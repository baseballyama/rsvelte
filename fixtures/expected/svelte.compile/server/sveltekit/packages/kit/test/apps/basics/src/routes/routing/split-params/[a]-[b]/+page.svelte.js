import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(page.params.a)}</h1> <h2>${$.escape(page.params.b)}</h2>`);
	});
}