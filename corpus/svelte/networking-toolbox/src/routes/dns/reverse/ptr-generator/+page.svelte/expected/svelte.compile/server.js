import * as $ from 'svelte/internal/server';
import ReversePTRGenerator from '$lib/components/tools/ReversePTRGenerator.svelte';

export default function _page($$renderer) {
	ReversePTRGenerator($$renderer, {});
}