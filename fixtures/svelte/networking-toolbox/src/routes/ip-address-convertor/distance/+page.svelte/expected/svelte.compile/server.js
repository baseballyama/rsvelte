import * as $ from 'svelte/internal/server';
import IPDistance from '$lib/components/tools/IPDistance.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	IPDistance($$renderer, {});
	$$renderer.push(`<!----></div>`);
}