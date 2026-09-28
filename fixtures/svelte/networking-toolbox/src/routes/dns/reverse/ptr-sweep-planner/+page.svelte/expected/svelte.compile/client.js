import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PTRSweepPlanner from '$lib/components/tools/PTRSweepPlanner.svelte';

export default function _page($$anchor) {
	PTRSweepPlanner($$anchor, {});
}