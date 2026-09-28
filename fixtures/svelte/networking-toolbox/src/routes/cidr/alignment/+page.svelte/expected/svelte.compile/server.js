import * as $ from 'svelte/internal/server';
import CIDRAlignment from '$lib/components/tools/CIDRAlignment.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	CIDRAlignment($$renderer, {});
	$$renderer.push(`<!----></div>`);
}