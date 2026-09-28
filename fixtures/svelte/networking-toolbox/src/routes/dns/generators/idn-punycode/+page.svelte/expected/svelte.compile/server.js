import * as $ from 'svelte/internal/server';
import IDNPunycodeConverter from '$lib/components/tools/IDNPunycodeConverter.svelte';

export default function _page($$renderer) {
	IDNPunycodeConverter($$renderer, {});
}