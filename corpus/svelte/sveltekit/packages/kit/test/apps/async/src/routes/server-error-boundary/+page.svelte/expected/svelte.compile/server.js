import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error('render error');

		$$renderer.push(`<h1>This should not be visible</h1>`);
	});
}