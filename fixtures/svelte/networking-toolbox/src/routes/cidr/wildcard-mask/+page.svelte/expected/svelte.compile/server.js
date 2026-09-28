import * as $ from 'svelte/internal/server';
import WildcardMask from '$lib/components/tools/WildcardMask.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	WildcardMask($$renderer, {});
	$$renderer.push(`<!----></div>`);
}