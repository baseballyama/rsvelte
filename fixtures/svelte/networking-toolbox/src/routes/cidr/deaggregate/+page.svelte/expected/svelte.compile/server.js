import * as $ from 'svelte/internal/server';
import CIDRDeaggregate from '$lib/components/tools/CIDRDeaggregate.svelte';

export default function _page($$renderer) {
	CIDRDeaggregate($$renderer, {});
}