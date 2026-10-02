import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		$$renderer.push(`<h1>${$.escape(page.params.rest)}</h1> <h2>${$.escape(data.rest)}</h2> <a href="/routing/rest/xyz/abc/deep">deep</a> <a href="/routing/rest/xyz/abc">abc</a> <a href="/routing/rest/xyz/abc/def">def</a> <a href="/routing/rest/xyz/abc/def/ghi">ghi</a> <a href="/routing/rest">empty</a>`);
	});
}