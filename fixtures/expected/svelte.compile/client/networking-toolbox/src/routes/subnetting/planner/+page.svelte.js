import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SubnetPlanner from '$lib/components/tools/SubnetPlanner.svelte';

export default function _page($$anchor) {
	SubnetPlanner($$anchor, {});
}