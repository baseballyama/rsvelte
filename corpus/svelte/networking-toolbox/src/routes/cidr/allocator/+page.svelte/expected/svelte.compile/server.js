import * as $ from 'svelte/internal/server';
import CIDRAllocator from '$lib/components/tools/CIDRAllocator.svelte';

export default function _page($$renderer) {
	CIDRAllocator($$renderer, {});
}