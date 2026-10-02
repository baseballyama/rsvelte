import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRCompare from '$lib/components/tools/CIDRCompare.svelte';

export default function _page($$anchor) {
	CIDRCompare($$anchor, {});
}