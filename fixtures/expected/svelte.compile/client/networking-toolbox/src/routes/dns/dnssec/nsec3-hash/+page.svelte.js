import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NSEC3Hash from '$lib/components/tools/NSEC3Hash.svelte';

export default function _page($$anchor) {
	NSEC3Hash($$anchor, {});
}