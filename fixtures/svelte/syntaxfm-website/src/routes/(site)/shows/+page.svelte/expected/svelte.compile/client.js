import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { PER_PAGE } from '$const';
import Pagination from '$lib/Pagination.svelte';
import SelectMenu from '$lib/SelectMenu.svelte';
import ShowCard from '$lib/ShowCard.svelte';
import { queryParameters } from 'sveltekit-search-params';

var root = $.from_html(`<meta name="robots" content="noindex"/>`);
var root_1 = $.from_html(`<section class="svelte-jofuj8"><div class="list-heading svelte-jofuj8"><h1 class="h3">All Episodes</h1> <div style="display:flex; gap: 10px;"><!> <!> <!> <a class="button subtle" href="/guests">Guests →</a></div></div> <!> <div class="shows"></div> <!></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let shows = $.derived(() => $$props.data.shows);
	const store = queryParameters();

	// We tell google to ignore filters, BUT not ?page=2...Infinity
	let isNoindexPage = $.derived(() => ['order', 'type', 'sort', 'perPage'].some((filter) => $page().url.searchParams.has(filter)));

	var section = root_1();

	$.head('jofuj8', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if ($.get(isNoindexPage)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node_1 = $.child(div_1);

	{
		let $0 = $.derived(() => $store().type || '');

		SelectMenu(node_1, {
			popover_id: 'filter-type',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).type = e.detail, $.untrack($store));
			},
			button_text: 'Type',
			button_icon: 'filter',
			get value() {
				return $.get($0);
			},

			options: [
				{ value: '', label: 'All' },
				{ value: 'hasty', label: 'Hasty' },
				{ value: 'tasty', label: 'Tasty' },
				{ value: 'supper', label: 'Supper Club' },
				{ value: 'special', label: 'Special' }
			]
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $store().perPage?.toString() || '10');

		SelectMenu(node_2, {
			popover_id: 'filter-perPage',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).perPage = e.detail, $.untrack($store));
			},
			value_as_label: true,
			button_text: 'Per Page',
			get value() {
				return $.get($0);
			},

			options: [
				{ value: '10', label: '10' },
				{ value: '20', label: '20' },
				{ value: '40', label: '40' }
			]
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $store().order || 'desc');

		SelectMenu(node_3, {
			popover_id: 'filter-order',
			onselect: (e) => {
				$.store_mutate(store, $.untrack($store).order = e.detail, $.untrack($store));
			},

			get value() {
				return $.get($0);
			},
			button_text: 'Sort',
			button_icon: 'sort',
			options: [
				{ value: 'desc', label: 'Newest To Oldest' },
				{ value: 'asc', label: 'Oldest To Newest' }
			]
		});
	}

	$.next(2);
	$.reset(div_1);
	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => parseInt($store().page || '1'));
		let $1 = $.derived(() => $$props.data.count || 69);
		let $2 = $.derived(() => parseInt($store().perPage || PER_PAGE.toString()));

		Pagination(node_4, {
			get page() {
				return $.get($0);
			},

			get count() {
				return $.get($1);
			},

			get perPage() {
				return $.get($2);
			}
		});
	}

	var div_2 = $.sibling(node_4, 2);

	$.each(div_2, 21, () => $.get(shows), (show) => show.id, ($$anchor, show) => {
		ShowCard($$anchor, {
			get show() {
				return $.get(show);
			},
			display: 'list',
			heading: 'h2'
		});
	});

	$.reset(div_2);

	var node_5 = $.sibling(div_2, 2);

	{
		let $0 = $.derived(() => parseInt($store().page || '1'));
		let $1 = $.derived(() => $$props.data.count || 69);
		let $2 = $.derived(() => parseInt($store().perPage || PER_PAGE.toString()));

		Pagination(node_5, {
			get page() {
				return $.get($0);
			},

			get count() {
				return $.get($1);
			},

			get perPage() {
				return $.get($2);
			}
		});
	}

	$.reset(section);
	$.append($$anchor, section);
	$.pop();
	$$cleanup();
}