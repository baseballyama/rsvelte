import * as $ from 'svelte/internal/server';
import ZoneStats from '$lib/components/tools/ZoneStats.svelte';

export default function _page($$renderer) {
	ZoneStats($$renderer, {});
}