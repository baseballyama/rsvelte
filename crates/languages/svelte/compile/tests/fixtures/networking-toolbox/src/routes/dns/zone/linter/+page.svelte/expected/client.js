import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ZoneLinter from '$lib/components/tools/ZoneLinter.svelte';

export default function _page($$anchor) {
	ZoneLinter($$anchor, {});
}