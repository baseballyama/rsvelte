import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IAIDCalculator from '$lib/components/tools/IAIDCalculator.svelte';

export default function _page($$anchor) {
	IAIDCalculator($$anchor, {});
}