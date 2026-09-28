import * as $ from 'svelte/internal/server';
import ReverseZoneGenerator from '$lib/components/tools/ReverseZoneGenerator.svelte';

export default function _page($$renderer) {
	ReverseZoneGenerator($$renderer, {});
}