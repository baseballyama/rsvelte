import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a href="/routing/">/routing/</a> <a href="/routing/?">/routing/?</a> <a href="/routing/?foo=bar">/routing/?foo=bar</a> <a${$.attr('href', `http://localhost:${$.stringify(page.url.searchParams.get('port'))}/with-slash/`)}>external</a>`);
	});
}