import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<h1>ISR Page</h1> <p id="rendered-at">${$.escape(data.rendered_at)}</p>`);
	});
}