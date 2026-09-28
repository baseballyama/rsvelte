import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params } = $$props;

		$$renderer.push(`<p>x: ${$.escape(params.x)}</p>`);
	});
}