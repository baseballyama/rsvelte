import * as $ from 'svelte/internal/server';
import TTLCalculator from '$lib/components/tools/TTLCalculator.svelte';

export default function _page($$renderer) {
	TTLCalculator($$renderer, {});
}