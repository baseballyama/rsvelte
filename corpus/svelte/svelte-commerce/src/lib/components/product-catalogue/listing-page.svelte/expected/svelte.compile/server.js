import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import DesktopFilter from '$lib/components/product-catalogue/desktop-filter.svelte';
import MobileFilter from '$lib/components/product-catalogue/mobile-filter.svelte';
import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
import { selectSort } from '$lib/core/utils/index.js';
import ListingGrid from '$lib/components/product-catalogue/listing-grid.svelte';
import ListingHeader from './listing-header.svelte';

export default function Listing_page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = $.derived(() => page.data);
		let selectedSort = page.url.searchParams.get('sort') ?? 'popularity:desc';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="ed-plp svelte-109fhqo"><div class="page-width hidden lg:block ed-plp__crumbs svelte-109fhqo">`);
			Breadcrumb($$renderer, { categoryHierarchy: data()?.products?.categoryHierarchy });
			$$renderer.push(`<!----></div> <div class="page-width inter-gap flex h-full min-h-screen flex-row ed-plp__row svelte-109fhqo">`);

			if (Object.keys(data().products.facets || {}).length) {
				$$renderer.push(`<!--[0--><div class="hidden max-w-[25%] border-input md:block ed-plp__aside svelte-109fhqo">`);
				DesktopFilter($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

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

			$$renderer.push(`<!----> <div class="inter-gap flex flex-1 flex-col ed-plp__main">`);

			ListingHeader($$renderer, {
				get selectedSort() {
					return selectedSort;
				},

				set selectedSort($$value) {
					selectedSort = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);
			ListingGrid($$renderer, {});
			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}