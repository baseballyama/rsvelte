import * as $ from 'svelte/internal/server';
import NextAvailable from '$lib/components/tools/NextAvailable.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	NextAvailable($$renderer, {});
	$$renderer.push(`<!----></div>`);
}