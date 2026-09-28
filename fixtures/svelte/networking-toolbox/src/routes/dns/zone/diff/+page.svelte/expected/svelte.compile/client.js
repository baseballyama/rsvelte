import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ZoneDiff from '$lib/components/tools/ZoneDiff.svelte';

export default function _page($$anchor) {
	ZoneDiff($$anchor, {});
}