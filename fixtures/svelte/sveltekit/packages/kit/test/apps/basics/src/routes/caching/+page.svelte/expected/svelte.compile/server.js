import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>this page will be cached for 30 seconds</h1>`);
}