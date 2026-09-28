import * as $ from 'svelte/internal/server';
import EUI64 from '$lib/components/tools/EUI64.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	EUI64($$renderer, {});
	$$renderer.push(`<!----></div>`);
}