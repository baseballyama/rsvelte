import * as $ from 'svelte/internal/server';
import NAPTRBuilder from '$lib/components/tools/NAPTRBuilder.svelte';

export default function _page($$renderer) {
	NAPTRBuilder($$renderer, {});
}