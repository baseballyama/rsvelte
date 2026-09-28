import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$.head('1muy295', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>b</title>`);
		});
	});

	$$renderer.push(`<h1>b</h1>`);
}