import * as $ from 'svelte/internal/server';
import ZoneLinter from '$lib/components/tools/ZoneLinter.svelte';

export default function _page($$renderer) {
	ZoneLinter($$renderer, {});
}