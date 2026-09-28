import * as $ from 'svelte/internal/server';
import TLSAGenerator from '$lib/components/tools/TLSAGenerator.svelte';

export default function _page($$renderer) {
	TLSAGenerator($$renderer, {});
}