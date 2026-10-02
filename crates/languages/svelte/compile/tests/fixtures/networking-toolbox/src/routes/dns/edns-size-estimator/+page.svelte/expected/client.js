import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EDNSSizeEstimator from '$lib/components/tools/EDNSSizeEstimator.svelte';

export default function _page($$anchor) {
	EDNSSizeEstimator($$anchor, {});
}