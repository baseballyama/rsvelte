import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error('nested render error');

		$$renderer.push(`<h1>This nested page should not be visible</h1>`);
	});
}