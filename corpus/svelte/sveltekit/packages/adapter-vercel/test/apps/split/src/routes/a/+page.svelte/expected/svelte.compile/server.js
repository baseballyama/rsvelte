import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>This route will be served by a different function because we use the split config</p>`);
}