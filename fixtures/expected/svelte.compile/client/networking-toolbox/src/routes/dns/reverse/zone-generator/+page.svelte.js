import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ReverseZoneGenerator from '$lib/components/tools/ReverseZoneGenerator.svelte';

export default function _page($$anchor) {
	ReverseZoneGenerator($$anchor, {});
}