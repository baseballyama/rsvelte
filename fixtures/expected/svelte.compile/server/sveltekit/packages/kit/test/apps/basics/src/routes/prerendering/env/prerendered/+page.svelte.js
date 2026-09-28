import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h2>prerendered</h2>`);
}