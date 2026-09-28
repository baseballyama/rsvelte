import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DUIDGenerator from '$lib/components/tools/DUIDGenerator.svelte';

export default function _page($$anchor) {
	DUIDGenerator($$anchor, {});
}