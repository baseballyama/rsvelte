import * as $ from 'svelte/internal/server';
import IPEnumerate from '$lib/components/tools/IPEnumerate.svelte';

export default function _page($$renderer) {
	IPEnumerate($$renderer, {});
}