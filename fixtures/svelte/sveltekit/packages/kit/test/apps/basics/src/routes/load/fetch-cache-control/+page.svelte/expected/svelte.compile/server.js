import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/load/fetch-cache-control/load-data">load-data</a> <a href="/load/fetch-cache-control/headers-diff">headers-diff</a> <a href="/load/fetch-cache-control/b64">b64</a>`);
}