import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IDNPunycodeConverter from '$lib/components/tools/IDNPunycodeConverter.svelte';

export default function _page($$anchor) {
	IDNPunycodeConverter($$anchor, {});
}