import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LeaseTimeCalculator from '$lib/components/tools/LeaseTimeCalculator.svelte';

export default function _page($$anchor) {
	LeaseTimeCalculator($$anchor, {});
}