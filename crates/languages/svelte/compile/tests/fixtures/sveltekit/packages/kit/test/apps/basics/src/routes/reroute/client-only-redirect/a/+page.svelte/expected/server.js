import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Should have been rewritten to <code>/reroute/client-only-redirect/b</code></h1>`);
}