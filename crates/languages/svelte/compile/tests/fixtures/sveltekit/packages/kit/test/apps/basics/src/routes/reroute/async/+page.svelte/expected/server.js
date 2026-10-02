import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/reroute/async/a">Go to url that should be rewritten</a> <a href="/reroute/async/c">Go to url that should be rewritten and its reroute api call prerendered</a>`);
}