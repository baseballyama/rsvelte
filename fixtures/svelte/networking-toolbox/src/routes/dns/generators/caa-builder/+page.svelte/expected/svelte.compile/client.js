import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CAABuilder from '$lib/components/tools/CAABuilder.svelte';

export default function _page($$anchor) {
	CAABuilder($$anchor, {});
}