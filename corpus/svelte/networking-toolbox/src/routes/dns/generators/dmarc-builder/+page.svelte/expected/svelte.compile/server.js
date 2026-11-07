import * as $ from 'svelte/internal/server';
import DMARCBuilder from '$lib/components/tools/DMARCBuilder.svelte';

export default function _page($$renderer) {
	DMARCBuilder($$renderer, {});
}