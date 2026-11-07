import * as $ from 'svelte/internal/server';
import ReverseZonesCalculator from '$lib/components/tools/ReverseZonesCalculator.svelte';

export default function _page($$renderer) {
	ReverseZonesCalculator($$renderer, {});
}