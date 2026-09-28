import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>page with a POST-only endpoint sibling</h1>`);
}