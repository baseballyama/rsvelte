import * as $ from 'svelte/internal/server';
import IPv6Normalize from '$lib/components/tools/IPv6Normalize.svelte';

export default function _page($$renderer) {
	IPv6Normalize($$renderer, {});
}