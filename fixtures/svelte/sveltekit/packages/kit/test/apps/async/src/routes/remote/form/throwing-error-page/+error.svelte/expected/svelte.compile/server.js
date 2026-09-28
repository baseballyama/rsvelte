import * as $ from 'svelte/internal/server';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error('error page render error');

		$$renderer.push(`<p>This error page should not be visible</p>`);
	});
}