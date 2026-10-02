import * as $ from 'svelte/internal/server';
import DSGenerator from '$lib/components/tools/DSGenerator.svelte';

export default function _page($$renderer) {
	DSGenerator($$renderer, {});
}