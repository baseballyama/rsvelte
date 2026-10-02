import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TTLCalculator from '$lib/components/tools/TTLCalculator.svelte';

export default function _page($$anchor) {
	TTLCalculator($$anchor, {});
}