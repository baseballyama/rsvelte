import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RPBuilder from '$lib/components/tools/RPBuilder.svelte';

export default function _page($$anchor) {
	RPBuilder($$anchor, {});
}