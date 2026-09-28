import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/reroute/external/rewritten">Go to rewritten page</a> <a href="https://expired.badssl.com/" data-test="external-url">External Link</a>`);
}