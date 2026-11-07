import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>this page will error when SvelteKit tries to register the service worker</p>`);
}