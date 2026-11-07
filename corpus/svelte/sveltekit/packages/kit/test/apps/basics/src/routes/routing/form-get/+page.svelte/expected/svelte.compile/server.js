import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let type = '...';

		afterNavigate((navigation) => {
			type = /** @type {string} */ (navigation.type);
		});

		$$renderer.push(`<h1>${$.escape(page.url.searchParams.get('q') ?? '...')}</h1> <h2>${$.escape(type)}</h2> <h3>${$.escape(page.url.searchParams.get('foo') ?? '...')}</h3> <form><input name="q"/> <button type="submit" name="foo" value="bar">Submit</button></form>`);
	});
}