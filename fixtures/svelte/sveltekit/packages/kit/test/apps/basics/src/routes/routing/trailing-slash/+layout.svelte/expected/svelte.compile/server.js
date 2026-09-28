import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<ul data-sveltekit-preload-data="hover"><li><a href="/routing/trailing-slash/always">/always</a></li> <li><a href="/routing/trailing-slash/ignore/">/ignore/</a></li> <li><a href="/routing/trailing-slash/never/">/never/</a></li></ul> <p>${$.escape(page.url.pathname)}</p> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}