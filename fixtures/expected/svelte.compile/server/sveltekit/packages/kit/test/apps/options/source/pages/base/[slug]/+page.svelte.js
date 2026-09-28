import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import SvelteLogo from '#lib/SvelteLogo.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		SvelteLogo($$renderer, {});
		$$renderer.push(`<!----> <h2>${$.escape(page.params.slug)}</h2> <a href="/path-base/base/two">/path-base/base/two</a>`);
	});
}