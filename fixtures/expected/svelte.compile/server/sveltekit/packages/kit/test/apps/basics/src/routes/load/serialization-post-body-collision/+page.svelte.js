import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		let { data } = $$props;

		$$renderer.push(`<h1>${$.escape(data.post)}</h1> <p>${$.escape(data.get)}</p>`);
	});
}