import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DNSKEYKeyTag from '$lib/components/tools/DNSKEYKeyTag.svelte';

export default function _page($$anchor) {
	DNSKEYKeyTag($$anchor, {});
}