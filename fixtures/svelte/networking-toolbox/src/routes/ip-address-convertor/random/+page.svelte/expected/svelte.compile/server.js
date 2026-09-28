import * as $ from 'svelte/internal/server';
import RandomIP from '$lib/components/tools/RandomIP.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	RandomIP($$renderer, {});
	$$renderer.push(`<!----></div>`);
}