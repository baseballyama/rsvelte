import * as $ from 'svelte/internal/server';
import DKIMKeyGenerator from '$lib/components/tools/DKIMKeyGenerator.svelte';

export default function _page($$renderer) {
	DKIMKeyGenerator($$renderer, {});
}