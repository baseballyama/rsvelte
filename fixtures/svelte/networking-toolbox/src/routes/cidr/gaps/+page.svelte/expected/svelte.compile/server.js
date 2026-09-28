import * as $ from 'svelte/internal/server';
import FreeSpaceFinder from '$lib/components/tools/FreeSpaceFinder.svelte';

export default function _page($$renderer) {
	FreeSpaceFinder($$renderer, {});
}