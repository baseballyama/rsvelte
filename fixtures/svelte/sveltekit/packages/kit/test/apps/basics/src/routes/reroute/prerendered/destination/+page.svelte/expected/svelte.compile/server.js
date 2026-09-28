import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>reroute that points to prerendered page works</h1>`);
}