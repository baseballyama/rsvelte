import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RRSIGPlanner from '$lib/components/tools/RRSIGPlanner.svelte';

export default function _page($$anchor) {
	RRSIGPlanner($$anchor, {});
}