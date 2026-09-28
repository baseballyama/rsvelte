import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;

		$$renderer.push(`<p>${$.escape(data.message)}</p>`);
	});
}