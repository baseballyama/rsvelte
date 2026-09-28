import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a${$.attr('href', resolve('/trailing-slash-server/prerender'))}>${$.escape(resolve('/trailing-slash-server/prerender'))}</a>`);
	});
}