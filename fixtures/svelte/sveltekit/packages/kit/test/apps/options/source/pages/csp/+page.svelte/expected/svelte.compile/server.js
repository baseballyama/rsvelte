import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('8xqtbk', $$renderer, ($$renderer) => {
			$$renderer.push(`<script${$.attr('src', `http://localhost:${$.stringify(page.url.searchParams.get('port'))}/blocked.js`)}></script>`);
			$$renderer.push(`<!---->`);
		});
	});
}