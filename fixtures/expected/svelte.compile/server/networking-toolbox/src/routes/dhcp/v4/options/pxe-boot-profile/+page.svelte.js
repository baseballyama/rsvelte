import * as $ from 'svelte/internal/server';
import PXEProfileBuilder from '$lib/components/tools/PXEProfileBuilder.svelte';

export default function _page($$renderer) {
	PXEProfileBuilder($$renderer, {});
}