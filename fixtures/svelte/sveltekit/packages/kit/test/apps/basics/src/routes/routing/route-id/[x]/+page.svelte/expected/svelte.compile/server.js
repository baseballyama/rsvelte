import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		$$renderer.push(`<h1>route.id in load: ${$.escape(data.route.id)}</h1> <h2>route.id in store: ${$.escape(page.route.id)}</h2>`);
	});
}