import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DSGenerator from '$lib/components/tools/DSGenerator.svelte';

export default function _page($$anchor) {
	DSGenerator($$anchor, {});
}