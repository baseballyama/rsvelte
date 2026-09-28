import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ReversePTRGenerator from '$lib/components/tools/ReversePTRGenerator.svelte';

export default function _page($$anchor) {
	ReversePTRGenerator($$anchor, {});
}