import * as $ from 'svelte/internal/server';
import DNSLabelNormalizer from '$lib/components/tools/DNSLabelNormalizer.svelte';

export default function _page($$renderer) {
	DNSLabelNormalizer($$renderer, {});
}