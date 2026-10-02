import * as $ from 'svelte/internal/server';
import CIDRCompare from '$lib/components/tools/CIDRCompare.svelte';

export default function _page($$renderer) {
	CIDRCompare($$renderer, {});
}