import * as $ from 'svelte/internal/server';
import EDNSSizeEstimator from '$lib/components/tools/EDNSSizeEstimator.svelte';

export default function _page($$renderer) {
	EDNSSizeEstimator($$renderer, {});
}