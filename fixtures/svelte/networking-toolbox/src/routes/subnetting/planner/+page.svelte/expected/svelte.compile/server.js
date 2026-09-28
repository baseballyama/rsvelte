import * as $ from 'svelte/internal/server';
import SubnetPlanner from '$lib/components/tools/SubnetPlanner.svelte';

export default function _page($$renderer) {
	SubnetPlanner($$renderer, {});
}