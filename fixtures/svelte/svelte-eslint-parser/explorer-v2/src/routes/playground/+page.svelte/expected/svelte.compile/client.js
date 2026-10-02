import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ESLintPlayground from '$lib/ESLintPlayground.svelte';

export default function _page($$anchor) {
	$.head('1ft0ped', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Playground | svelte-eslint-parser';
		});
	});

	ESLintPlayground($$anchor, {});
}