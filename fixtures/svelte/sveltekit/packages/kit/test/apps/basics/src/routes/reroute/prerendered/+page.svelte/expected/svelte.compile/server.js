import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/reroute/prerendered/to-destination">to prerendered page</a>`);
}