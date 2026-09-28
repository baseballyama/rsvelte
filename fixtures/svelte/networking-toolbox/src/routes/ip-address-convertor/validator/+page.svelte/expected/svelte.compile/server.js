import * as $ from 'svelte/internal/server';
import IPValidator from '$lib/components/tools/IPValidator.svelte';

export default function _page($$renderer) {
	IPValidator($$renderer, {});
}