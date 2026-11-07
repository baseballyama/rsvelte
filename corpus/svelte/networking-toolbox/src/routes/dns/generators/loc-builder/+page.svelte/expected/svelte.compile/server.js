import * as $ from 'svelte/internal/server';
import LOCBuilder from '$lib/components/tools/LOCBuilder.svelte';

export default function _page($$renderer) {
	LOCBuilder($$renderer, {});
}