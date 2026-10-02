import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ZoneStats from '$lib/components/tools/ZoneStats.svelte';

export default function _page($$anchor) {
	ZoneStats($$anchor, {});
}