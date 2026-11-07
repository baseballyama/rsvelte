import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<p data-data="">${$.escape(JSON.stringify(data.params))}
	${$.escape(data.route.id)}
	${$.escape(data.url.pathname + data.url.search + data.url.hash)}</p> <p data-page="">${$.escape(JSON.stringify(page.params))}
	${$.escape(page.route.id)}
	${$.escape(page.url.pathname + page.url.search + page.url.hash)}</p>`);
	});
}