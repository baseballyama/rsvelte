import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const href = new URL('/prerender-origin/dynamic', page.url.origin).href;

		$$renderer.push(`<a${$.attr('href', href)}>Please crawl this</a>`);
	});
}