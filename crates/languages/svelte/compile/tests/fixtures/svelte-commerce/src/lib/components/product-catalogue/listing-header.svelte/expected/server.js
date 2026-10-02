import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { sortOptions } from '$lib/config.js';
import { selectSort } from '$lib/core/utils/index.js';

export default function Listing_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { selectedSort = void 0 } = $$props;
		const data = $.derived(() => page.data);

		$$renderer.push(`<div class="ed-lh flex flex-wrap items-center justify-between gap-y-2 svelte-7ok2xa"><div class="ed-lh__group intra-gap flex items-center svelte-7ok2xa"><h1 class="page-heading ed-lh__title svelte-7ok2xa">`);

		if (page.url.searchParams.get('search')) {
			$$renderer.push(`<!--[0-->Search Results: "${$.escape(page.url.searchParams.get('search'))}"`);
		} else if (data().products?.categoryHierarchy?.length > 0) {
			$$renderer.push(`<!--[1-->${$.escape(data().products.categoryHierarchy[data().products.categoryHierarchy.length - 1].name)}`);
		} else {
			$$renderer.push(`<!--[-1-->All Products`);
		}

		$$renderer.push(`<!--]--></h1> <div class="flex flex-col"><span class="ed-lh__count text-sm tracking-widest text-gray-900 dark:text-gray-200 svelte-7ok2xa">${$.escape(data().products.count > 999 ? '1000+' : data().products.count)} Products</span></div></div> `);

		if (data().products.data.length) {
			$$renderer.push(`<!--[0--><div class="ed-lh__sort hidden items-center gap-2 lg:flex"><span class="ed-lh__sortlabel text-[10px] font-bold uppercase tracking-widest text-gray-400 svelte-7ok2xa">Sort by</span> `);

			Select($$renderer, {
				class: '!mb-0 ed-lh__select',
				id: 'sort-by',
				value: selectedSort,
				data: sortOptions,
				optionSelected: (value) => selectSort(value)
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (data()?.products?.category?.description) {
			$$renderer.push(`<!--[0--><div class="ed-lh__desc mt-4 svelte-7ok2xa" style="white-space: pre-line">${$.html(data()?.products?.category?.description)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { selectedSort });
	});
}