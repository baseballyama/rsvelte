import * as $ from 'svelte/internal/server';
import ESLintPlayground from '$lib/ESLintPlayground.svelte';

export default function _page($$renderer) {
	$.head('1ft0ped', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Playground | svelte-eslint-parser</title>`);
		});
	});

	ESLintPlayground($$renderer, {});
}