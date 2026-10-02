import * as $ from 'svelte/internal/server';
import NthIP from '$lib/components/tools/NthIP.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	NthIP($$renderer, {});
	$$renderer.push(`<!----></div>`);
}