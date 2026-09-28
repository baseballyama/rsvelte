import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a${$.attr('data-sveltekit-preload-data', false)} href="/remote/query-redirect/from-page">from page</a> <a${$.attr('data-sveltekit-preload-data', false)} href="/remote/query-redirect/from-common-layout">from layout</a>`);
}