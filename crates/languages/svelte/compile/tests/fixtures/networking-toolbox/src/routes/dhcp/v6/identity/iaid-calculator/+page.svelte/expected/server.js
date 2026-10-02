import * as $ from 'svelte/internal/server';
import IAIDCalculator from '$lib/components/tools/IAIDCalculator.svelte';

export default function _page($$renderer) {
	IAIDCalculator($$renderer, {});
}