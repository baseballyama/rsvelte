import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRAllocator from '$lib/components/tools/CIDRAllocator.svelte';

export default function _page($$anchor) {
	CIDRAllocator($$anchor, {});
}