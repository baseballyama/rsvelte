import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ULAGenerator from '$lib/components/tools/ULAGenerator.svelte';

export default function _page($$anchor) {
	ULAGenerator($$anchor, {});
}