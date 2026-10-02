import * as $ from 'svelte/internal/server';
import PTRSweepPlanner from '$lib/components/tools/PTRSweepPlanner.svelte';

export default function _page($$renderer) {
	PTRSweepPlanner($$renderer, {});
}