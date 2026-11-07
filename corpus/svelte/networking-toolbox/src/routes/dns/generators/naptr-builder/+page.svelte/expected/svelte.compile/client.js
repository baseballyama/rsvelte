import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NAPTRBuilder from '$lib/components/tools/NAPTRBuilder.svelte';

export default function _page($$anchor) {
	NAPTRBuilder($$anchor, {});
}