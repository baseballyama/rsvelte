import * as $ from 'svelte/internal/server';
import ULAGenerator from '$lib/components/tools/ULAGenerator.svelte';

export default function _page($$renderer) {
	ULAGenerator($$renderer, {});
}