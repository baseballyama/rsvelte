import * as $ from 'svelte/internal/server';
import RPBuilder from '$lib/components/tools/RPBuilder.svelte';

export default function _page($$renderer) {
	RPBuilder($$renderer, {});
}