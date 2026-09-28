import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Welcome to a test project</h1> <a href="/anchor-with-manual-scroll/anchor-onmount#go-to-element" class="svelte-mhookp">Anchor demo</a>`);
}