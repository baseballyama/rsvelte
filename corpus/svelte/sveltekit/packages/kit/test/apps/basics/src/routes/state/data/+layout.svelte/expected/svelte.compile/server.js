import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div id="state-data">${$.escape(JSON.stringify(page.data))}</div> <div id="state-error">${$.escape(page.error?.message)}</div> <div id="url-hash">${$.escape(page.url.hash)}</div> <nav><a href="/state/data/xxx">xxx</a> <a href="/state/data/yyy">yyy</a> <a href="/state/data/zzz">zzz</a> <a href="/state/data/foo">foo</a></nav> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}