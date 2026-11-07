import * as $ from 'svelte/internal/server';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error, children } = $$props;

		$$renderer.push(`<h1>${$.escape(error.message)}</h1>`);
	});
}