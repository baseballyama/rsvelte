import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/reroute/basic/a">Go to url that should be rewritten</a>`);
}