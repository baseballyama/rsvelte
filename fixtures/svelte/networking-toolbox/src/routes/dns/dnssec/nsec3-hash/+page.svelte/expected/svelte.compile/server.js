import * as $ from 'svelte/internal/server';
import NSEC3Hash from '$lib/components/tools/NSEC3Hash.svelte';

export default function _page($$renderer) {
	NSEC3Hash($$renderer, {});
}