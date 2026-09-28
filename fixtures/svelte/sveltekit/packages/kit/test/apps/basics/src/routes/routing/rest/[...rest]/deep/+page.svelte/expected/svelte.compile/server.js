import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		$$renderer.push(`<h1>${$.escape(page.params.rest)}</h1> <h2>${$.escape(data.rest)}</h2> <a href="/routing/rest/xyz/abc/qwe/deep.json" rel="external">deep</a> <a href="/routing/rest/xyz/abc">back</a>`);
	});
}