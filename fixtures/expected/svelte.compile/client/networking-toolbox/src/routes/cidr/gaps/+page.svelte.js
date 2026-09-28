import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FreeSpaceFinder from '$lib/components/tools/FreeSpaceFinder.svelte';

export default function _page($$anchor) {
	FreeSpaceFinder($$anchor, {});
}