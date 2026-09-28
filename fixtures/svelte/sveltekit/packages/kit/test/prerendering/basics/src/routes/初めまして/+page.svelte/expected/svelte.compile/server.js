import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>Test for characters that need to be en/decoded during prerendering</p>`);
}