import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DKIMKeyGenerator from '$lib/components/tools/DKIMKeyGenerator.svelte';

export default function _page($$anchor) {
	DKIMKeyGenerator($$anchor, {});
}