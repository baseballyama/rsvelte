import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>This page will be cached for 5 minutes</h1>`);
}