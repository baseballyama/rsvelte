import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualScriptCode from '$lib/VirtualScriptCode.svelte';

export default function _page($$anchor) {
	$.head('ycprr9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Virtual Script Code | svelte-eslint-parser';
		});
	});

	VirtualScriptCode($$anchor, {});
}