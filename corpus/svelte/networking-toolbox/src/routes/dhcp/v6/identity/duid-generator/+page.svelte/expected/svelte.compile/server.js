import * as $ from 'svelte/internal/server';
import DUIDGenerator from '$lib/components/tools/DUIDGenerator.svelte';

export default function _page($$renderer) {
	DUIDGenerator($$renderer, {});
}