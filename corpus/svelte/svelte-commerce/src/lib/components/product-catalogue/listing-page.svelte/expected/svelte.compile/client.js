import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import DesktopFilter from '$lib/components/product-catalogue/desktop-filter.svelte';
import MobileFilter from '$lib/components/product-catalogue/mobile-filter.svelte';
import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
import { selectSort } from '$lib/core/utils/index.js';
import ListingGrid from '$lib/components/product-catalogue/listing-grid.svelte';
import ListingHeader from './listing-header.svelte';

var root = $.from_html(`<div class="hidden max-w-[25%] border-input md:block ed-plp__aside svelte-109fhqo"><!></div>`);
var root_1 = $.from_html(`<div class="ed-plp svelte-109fhqo"><div class="page-width hidden lg:block ed-plp__crumbs svelte-109fhqo"><!></div> <div class="page-width inter-gap flex h-full min-h-screen flex-row ed-plp__row svelte-109fhqo"><!> <!> <div class="inter-gap flex flex-1 flex-col ed-plp__main"><!> <!></div></div></div>`);

export default function Listing_page($$anchor, $$props) {
	$.push($$props, true);

	const data = $.derived(() => page.data);
	let selectedSort = $.state($.proxy(page.url.searchParams.get('sort') ?? 'popularity:desc'));
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(data)?.products?.categoryHierarchy);

		Breadcrumb(node, {
			get categoryHierarchy() {
				return $.get($0);
			}
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var node_2 = $.child(div_3);

			DesktopFilter(node_2, {});
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var d = $.derived(() => Object.keys($.get(data).products.facets || {}).length);

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	MobileFilter(node_3, {
		onSortChange: (value) => {
			$.set(selectedSort, value, true);
			selectSort(value);
		},

		get selectedSort() {
			return $.get(selectedSort);
		},

		set selectedSort($$value) {
			$.set(selectedSort, $$value, true);
		}
	});

	var div_4 = $.sibling(node_3, 2);
	var node_4 = $.child(div_4);

	ListingHeader(node_4, {
		get selectedSort() {
			return $.get(selectedSort);
		},

		set selectedSort($$value) {
			$.set(selectedSort, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	ListingGrid(node_5, {});
	$.reset(div_4);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}