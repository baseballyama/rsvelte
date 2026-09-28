import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { goto } from '$app/navigation';
import VendorCard from '$lib/components/vendor/vendor-card.svelte';
import DesktopFilter from '$lib/components/product-catalogue/desktop-filter.svelte';
import MobileFilter from '$lib/components/product-catalogue/mobile-filter.svelte';
import Pagination from '$lib/components/common/pagination.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { setCategoryFilterState, setDesktopFilterState } from '$lib/core/composables/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setDesktopFilterState();
		setCategoryFilterState();

		// The list comes from `+page.ts` (vendorService.list). This used to ignore its own loader and
		// call `searchService.searchWithQuery` from an $effect instead — a PRODUCT search, so the page
		// listed products under vendor headings, and because $effect never runs on the server the SSR
		// document was empty. Reading load data fixes both.
		const { data } = $$props;

		const vendors = $.derived(() => data?.vendors);
		let selectedSort = page.url.searchParams.get('sort') || 'recommended';

		const selectSort = (value) => {
			goto(`/vendors?sort=${value}`);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SeoHeader($$renderer, { metaTitle: 'Vendors' });
			$$renderer.push(`<!----> <div class="container mx-auto mt-2 flex h-full min-h-screen flex-row max-md:px-4 md:gap-2">`);

			if (page.data?.products?.facets) {
				$$renderer.push(`<!--[0--><div class="hidden border-r border-input md:block">`);
				DesktopFilter($$renderer, {});
				$$renderer.push(`<!----></div> <div class="block md:hidden">`);

				MobileFilter($$renderer, {
					onSortChange: (value) => {
						selectedSort = value;
						selectSort(value);
					},

					get selectedSort() {
						return selectedSort;
					},

					set selectedSort($$value) {
						selectedSort = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="flex-1"><div class="mb-4 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold capitalize">${$.escape(page.url.searchParams.get('search') || 'All Vendors')}</h1> <span class="text-sm text-gray-400">${$.escape(vendors()?.count)} Vendors found</span></div> <div class="hidden flex-row items-center gap-2 md:flex"><span class="text-sm font-normal text-gray-400">Sort by:</span> `);

			Select($$renderer, {
				class: '!mb-0',
				id: 'sort-by',
				value: selectedSort,
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

			$$renderer.push(`<!----></div> `);

			if (!vendors()?.data?.length) {
				$$renderer.push(`<!--[0--><div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No vendors found</p></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="mt-4 grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);

				const each_array = $.ensure_array_like(vendors().data);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let vendor = each_array[i];

					VendorCard($$renderer, { vendor, priority: i < 4 });
				}

				$$renderer.push(`<!--]--></div> `);

				if (vendors()?.totalPages > 1) {
					$$renderer.push(`<!--[0--><div class="mt-20">`);
					Pagination($$renderer, { noOfPage: vendors().totalPages });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}