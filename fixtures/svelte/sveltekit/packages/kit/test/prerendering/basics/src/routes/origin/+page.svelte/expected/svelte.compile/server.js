import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		$$renderer.push(`<h1>${$.escape(data.message)}</h1> <h2>${$.escape(page.url.origin)}</h2>`);
	});
}