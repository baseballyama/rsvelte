import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ReverseZonesCalculator from '$lib/components/tools/ReverseZonesCalculator.svelte';

export default function _page($$anchor) {
	ReverseZonesCalculator($$anchor, {});
}