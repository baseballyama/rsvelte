import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>The rewrite on this page should fail in the browser, causing a full navigation that resolves to <code>/reroute/error-handling/client-error-rewritten</code></h1>`);
}