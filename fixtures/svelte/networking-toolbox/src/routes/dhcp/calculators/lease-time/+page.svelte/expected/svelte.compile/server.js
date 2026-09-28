import * as $ from 'svelte/internal/server';
import LeaseTimeCalculator from '$lib/components/tools/LeaseTimeCalculator.svelte';

export default function _page($$renderer) {
	LeaseTimeCalculator($$renderer, {});
}