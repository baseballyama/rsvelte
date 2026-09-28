import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPv6Normalize from '$lib/components/tools/IPv6Normalize.svelte';

export default function _page($$anchor) {
	IPv6Normalize($$anchor, {});
}