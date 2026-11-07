import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PXEProfileBuilder from '$lib/components/tools/PXEProfileBuilder.svelte';

export default function _page($$anchor) {
	PXEProfileBuilder($$anchor, {});
}