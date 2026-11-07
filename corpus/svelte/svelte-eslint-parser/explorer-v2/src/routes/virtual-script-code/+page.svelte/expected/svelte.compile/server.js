import * as $ from 'svelte/internal/server';
import VirtualScriptCode from '$lib/VirtualScriptCode.svelte';

export default function _page($$renderer) {
	$.head('ycprr9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Virtual Script Code | svelte-eslint-parser</title>`);
		});
	});

	VirtualScriptCode($$renderer, {});
}