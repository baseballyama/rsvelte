import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/routing/route-id/foo">/routing/route-id/foo</a>`);
}