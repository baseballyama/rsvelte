import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRDeaggregate from '$lib/components/tools/CIDRDeaggregate.svelte';

export default function _page($$anchor) {
	CIDRDeaggregate($$anchor, {});
}