import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { page as pageStore } from '$app/stores';
import { PER_PAGE } from '$const';
import { quintOut } from 'svelte/easing';
import { fade } from 'svelte/transition';

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { count, perPage = PER_PAGE, page = 1 } = $$props;
		let totalPages = $.derived(() => Math.ceil(count / perPage));

		let generate_search_params = $.derived(() => (id, value) => {
			const searchParams = new URLSearchParams($.store_get($$store_subs ??= {}, '$pageStore', pageStore).url.search);

			if (!value) {
				searchParams.delete(id);
			} else {
				searchParams.set(id, value.toString());
			}

			return searchParams.toString();
		});

		function getNeighboringNumbers(number, maxNumber) {
			const start = Math.max(1, number - 3);
			const end = Math.min(maxNumber, number + 3);
			const result = Array.from({ length: end - start + 1 }, (_, index) => start + index);

			return result;
		}

		let pageNumbers = $.derived(() => getNeighboringNumbers(page, totalPages()));

		$$renderer.push(`<div class="pagination svelte-dlb7of"><a title="First Page"${$.attr('href', `?${$.stringify(generate_search_params()('page', ''))}`)} class="svelte-dlb7of">←←</a> <a${$.attr('href', `?${$.stringify(generate_search_params()('page', page > 1 ? page - 1 : ''))}`)} class="svelte-dlb7of">←</a> <!--[-->`);

		const each_array = $.ensure_array_like(pageNumbers());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let pageNumber = each_array[$$index];

			$$renderer.push(`<a${$.attr_class('page-number svelte-dlb7of', void 0, { 'current': page === pageNumber })}${$.attr('href', `?${$.stringify(generate_search_params()('page', pageNumber))}`)}>${$.escape(pageNumber)}</a>`);
		}

		$$renderer.push(`<!--]--> <a${$.attr('href', `?${$.stringify(generate_search_params()('page', page + 1))}`)} class="svelte-dlb7of">→</a> <a title="Last Page"${$.attr('href', `?${$.stringify(generate_search_params()('page', totalPages()))}`)} class="svelte-dlb7of">→→</a></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}