import * as $ from 'svelte/internal/server';
import RRSIGPlanner from '$lib/components/tools/RRSIGPlanner.svelte';

export default function _page($$renderer) {
	RRSIGPlanner($$renderer, {});
}