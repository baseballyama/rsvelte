import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { PER_PAGE } from '$const';
import Pagination from '$lib/Pagination.svelte';
import SelectMenu from '$lib/SelectMenu.svelte';
import ShowCard from '$lib/ShowCard.svelte';
import { queryParameters } from 'sveltekit-search-params';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let shows = $.derived(() => data.shows);
		const store = queryParameters();

		// We tell google to ignore filters, BUT not ?page=2...Infinity
		let isNoindexPage = $.derived(() => ['order', 'type', 'sort', 'perPage'].some((filter) => $.store_get($$store_subs ??= {}, '$page', page).url.searchParams.has(filter)));

		$.head('jofuj8', $$renderer, ($$renderer) => {
			if (isNoindexPage()) {
				$$renderer.push(`<!--[0--><meta name="robots" content="noindex"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<section class="svelte-jofuj8"><div class="list-heading svelte-jofuj8"><h1 class="h3">All Episodes</h1> <div style="display:flex; gap: 10px;">`);

		SelectMenu($$renderer, {
			popover_id: 'filter-type',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).type = e.detail);
			},
			button_text: 'Type',
			button_icon: 'filter',
			value: $.store_get($$store_subs ??= {}, '$store', store).type || '',
			options: [
				{ value: '', label: 'All' },
				{ value: 'hasty', label: 'Hasty' },
				{ value: 'tasty', label: 'Tasty' },
				{ value: 'supper', label: 'Supper Club' },
				{ value: 'special', label: 'Special' }
			]
		});

		$$renderer.push(`<!----> `);

		SelectMenu($$renderer, {
			popover_id: 'filter-perPage',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).perPage = e.detail);
			},
			value_as_label: true,
			button_text: 'Per Page',
			value: $.store_get($$store_subs ??= {}, '$store', store).perPage?.toString() || '10',
			options: [
				{ value: '10', label: '10' },
				{ value: '20', label: '20' },
				{ value: '40', label: '40' }
			]
		});

		$$renderer.push(`<!----> `);

		SelectMenu($$renderer, {
			popover_id: 'filter-order',
			onselect: (e) => {
				$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).order = e.detail);
			},
			value: $.store_get($$store_subs ??= {}, '$store', store).order || 'desc',
			button_text: 'Sort',
			button_icon: 'sort',
			options: [
				{ value: 'desc', label: 'Newest To Oldest' },
				{ value: 'asc', label: 'Oldest To Newest' }
			]
		});

		$$renderer.push(`<!----> <a class="button subtle" href="/guests">Guests →</a></div></div> `);

		Pagination($$renderer, {
			page: parseInt($.store_get($$store_subs ??= {}, '$store', store).page || '1'),
			count: data.count || 69,
			perPage: parseInt($.store_get($$store_subs ??= {}, '$store', store).perPage || PER_PAGE.toString())
		});

		$$renderer.push(`<!----> <div class="shows"><!--[-->`);

		const each_array = $.ensure_array_like(shows());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let show = each_array[$$index];

			ShowCard($$renderer, { show, display: 'list', heading: 'h2' });
		}

		$$renderer.push(`<!--]--></div> `);

		Pagination($$renderer, {
			page: parseInt($.store_get($$store_subs ??= {}, '$store', store).page || '1'),
			count: data.count || 69,
			perPage: parseInt($.store_get($$store_subs ??= {}, '$store', store).perPage || PER_PAGE.toString())
		});

		$$renderer.push(`<!----></section>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}