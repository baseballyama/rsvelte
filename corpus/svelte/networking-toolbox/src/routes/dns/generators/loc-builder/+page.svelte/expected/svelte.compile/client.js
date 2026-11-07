import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LOCBuilder from '$lib/components/tools/LOCBuilder.svelte';

export default function _page($$anchor) {
	LOCBuilder($$anchor, {});
}