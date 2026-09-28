import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPValidator from '$lib/components/tools/IPValidator.svelte';

export default function _page($$anchor) {
	IPValidator($$anchor, {});
}