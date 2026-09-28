import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DMARCBuilder from '$lib/components/tools/DMARCBuilder.svelte';

export default function _page($$anchor) {
	DMARCBuilder($$anchor, {});
}