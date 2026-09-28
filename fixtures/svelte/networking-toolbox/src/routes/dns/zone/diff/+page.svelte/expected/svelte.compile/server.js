import * as $ from 'svelte/internal/server';
import ZoneDiff from '$lib/components/tools/ZoneDiff.svelte';

export default function _page($$renderer) {
	ZoneDiff($$renderer, {});
}