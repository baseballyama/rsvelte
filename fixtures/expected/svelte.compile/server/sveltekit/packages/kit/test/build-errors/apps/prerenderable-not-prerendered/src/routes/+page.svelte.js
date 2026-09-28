import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/foo">this page is not prerendered, so this link is not crawled</a>`);
}