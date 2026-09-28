import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		const { data } = $$props;

		$$renderer.push(`<p data-testid="fetch-url">${$.escape(data.fetchUrl)}</p> <p data-testid="fetch-response">${$.escape(data.fetchResponse)}</p>`);
	});
}