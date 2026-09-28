import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPEnumerate from '$lib/components/tools/IPEnumerate.svelte';

export default function _page($$anchor) {
	IPEnumerate($$anchor, {});
}