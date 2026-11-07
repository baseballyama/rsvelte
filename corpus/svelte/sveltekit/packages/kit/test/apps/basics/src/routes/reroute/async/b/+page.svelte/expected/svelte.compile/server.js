import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Successfully rewritten, URL should still show a: ${$.escape(page.url.pathname)}</h1>`);
	});
}