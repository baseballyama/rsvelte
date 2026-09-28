import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$.head('1y47usg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>a</title>`);
		});
	});

	$$renderer.push(`<h1>a</h1>`);
}