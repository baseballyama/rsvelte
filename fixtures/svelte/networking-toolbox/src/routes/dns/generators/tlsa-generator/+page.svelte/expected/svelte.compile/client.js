import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TLSAGenerator from '$lib/components/tools/TLSAGenerator.svelte';

export default function _page($$anchor) {
	TLSAGenerator($$anchor, {});
}