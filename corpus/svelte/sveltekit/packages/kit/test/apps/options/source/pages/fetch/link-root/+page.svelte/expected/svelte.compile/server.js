import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		const { data } = $$props;

		$$renderer.push(`<h2>Fetch URLs</h2> <dl><!--[-->`);

		const each_array = $.ensure_array_like(data.fetches);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<dt>fetch${$.escape(index + 1)}-url</dt> <dd${$.attr('data-testid', `fetch${index + 1}-url`)}>${$.escape(item.url)}</dd>`);
		}

		$$renderer.push(`<!--]--></dl> <h2>Fetch Responses</h2> <dl><!--[-->`);

		const each_array_1 = $.ensure_array_like(data.fetches);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let item = each_array_1[index];

			$$renderer.push(`<dt>fetch${$.escape(index + 1)}-response</dt> <dd${$.attr('data-testid', `fetch${$.stringify(index + 1)}-response`)}>${$.escape(item.response)}</dd>`);
		}

		$$renderer.push(`<!--]--></dl> <h2>Fetch Redirects</h2> <dl><!--[-->`);

		const each_array_2 = $.ensure_array_like(data.fetches);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let item = each_array_2[index];

			$$renderer.push(`<dt>fetch${$.escape(index + 1)}-redirect</dt> <dd${$.attr('data-testid', `fetch${$.stringify(index + 1)}-redirect`)}>${$.escape(item.redirect)}</dd>`);
		}

		$$renderer.push(`<!--]--></dl>`);
	});
}