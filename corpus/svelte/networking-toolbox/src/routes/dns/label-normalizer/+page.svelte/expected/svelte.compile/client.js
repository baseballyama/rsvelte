import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DNSLabelNormalizer from '$lib/components/tools/DNSLabelNormalizer.svelte';

export default function _page($$anchor) {
	DNSLabelNormalizer($$anchor, {});
}