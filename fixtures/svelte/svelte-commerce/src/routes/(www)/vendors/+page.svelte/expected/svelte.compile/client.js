import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { goto } from '$app/navigation';
import VendorCard from '$lib/components/vendor/vendor-card.svelte';
import DesktopFilter from '$lib/components/product-catalogue/desktop-filter.svelte';
import MobileFilter from '$lib/components/product-catalogue/mobile-filter.svelte';
import Pagination from '$lib/components/common/pagination.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { setCategoryFilterState, setDesktopFilterState } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="hidden border-r border-input md:block"><!></div> <div class="block md:hidden"><!></div>`, 1);
var root_1 = $.from_html(`<div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No vendors found</p></div>`);
var root_2 = $.from_html(`<div class="mt-20"><!></div>`);
var root_3 = $.from_html(`<div class="mt-4 grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"></div> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="container mx-auto mt-2 flex h-full min-h-screen flex-row max-md:px-4 md:gap-2"><!> <div class="flex-1"><div class="mb-4 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold capitalize"> </h1> <span class="text-sm text-gray-400"> </span></div> <div class="hidden flex-row items-center gap-2 md:flex"><span class="text-sm font-normal text-gray-400">Sort by:</span> <!></div> <!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	setDesktopFilterState();
	setCategoryFilterState();

	// The list comes from `+page.ts` (vendorService.list). This used to ignore its own loader and
	// call `searchService.searchWithQuery` from an $effect instead — a PRODUCT search, so the page
	// listed products under vendor headings, and because $effect never runs on the server the SSR
	// document was empty. Reading load data fixes both.
	const vendors = $.derived(() => $$props.data?.vendors);

	let selectedSort = $.state($.proxy(page.url.searchParams.get('sort') || 'recommended'));

	const selectSort = (value) => {
		goto(`/vendors?sort=${value}`);
	};

	var fragment = root_4();
	var node = $.first_child(fragment);

	SeoHeader(node, { metaTitle: 'Vendors' });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var div_1 = $.first_child(fragment_1);
			var node_2 = $.child(div_1);

			DesktopFilter(node_2, {});
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.child(div_2);

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

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (page.data?.products?.facets) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node_1, 2);
	var div_4 = $.child(div_3);
	var h1 = $.child(div_4);
	var text = $.only_child(h1, true);
	var span = $.sibling(h1, 2);
	var text_1 = $.only_child(span);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_4 = $.sibling($.child(div_5), 2);

	Select(node_4, {
		class: '!mb-0',
		id: 'sort-by',
		get value() {
			return $.get(selectedSort);
		},

		data: [
			{ value: 'recommended', name: 'Recommended' },
			{ value: 'updatedAt', name: "What's New" },
			{ value: 'price-low-to-high', name: 'Price: Low to High' },
			{ value: 'price-high-to-low', name: 'Price: High to Low' },
			{ value: 'asc', name: 'Name: A-Z' },
			{ value: 'desc', name: 'Name: Z-A' },
			{ value: 'discount', name: 'Discount: High to Low' },
			{ value: 'rating', name: 'Rating: High to Low' }
		],
		optionSelected: (value) => selectSort(value)
	});

	$.reset(div_5);

	var node_5 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_6 = root_1();

			$.append($$anchor, div_6);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_3();
			var div_7 = $.first_child(fragment_2);

			$.each(div_7, 23, () => $.get(vendors).data, (vendor) => vendor.id, ($$anchor, vendor, i) => {
				{
					let $0 = $.derived(() => $.get(i) < 4);

					VendorCard($$anchor, {
						get vendor() {
							return $.get(vendor);
						},

						get priority() {
							return $.get($0);
						}
					});
				}
			});

			$.reset(div_7);

			var node_6 = $.sibling(div_7, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_8 = root_2();
					var node_7 = $.child(div_8);

					Pagination(node_7, {
						get noOfPage() {
							return $.get(vendors).totalPages;
						}
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_6, ($$render) => {
					if ($.get(vendors)?.totalPages > 1) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(vendors)?.data?.length) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, `${$.get(vendors)?.count ?? ''} Vendors found`);
		},
		[() => page.url.searchParams.get('search') || 'All Vendors']
	);

	$.append($$anchor, fragment);
	$.pop();
}