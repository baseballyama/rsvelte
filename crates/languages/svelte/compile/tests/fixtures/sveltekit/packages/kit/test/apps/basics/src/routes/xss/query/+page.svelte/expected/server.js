import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { to_pojo } from './utils.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		$$renderer.push(`<pre id="one">${$.escape(JSON.stringify(data.values))}</pre> <pre id="two">${$.escape(JSON.stringify(to_pojo(page.url.searchParams)))}</pre>`);
	});
}