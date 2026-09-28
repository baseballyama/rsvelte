import * as $ from 'svelte/internal/server';
import { productService } from '$lib/core/services/index.js';
import { onMount } from 'svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { toast } from '@misiki/kitcommerce-core';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';

export default function Featured_products($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;
		let products = null;
		let loadingForProducts = false;

		onMount(async () => {
			try {
				loadingForProducts = true;

				const res = await productService.listFeaturedProducts({ page: 1 });

				// The connector declares `listFeaturedProducts` as `PaginatedResponse<[Product]>`, i.e. a
				// list of one-element tuples, while the API returns a flat product list. `flat()` is the
				// type-safe (and, on a flat list, runtime no-op) bridge between the two.
				products = res?.data?.flat();
			} catch(e) {
				toast.error(e?.message || 'Failed to load products');
			} finally {
				loadingForProducts = false;
			}
		});

		$$renderer.push(`<div class="w-full py-8">`);

		if (block.metadata.showHeader) {
			$$renderer.push(`<!--[0--><div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left">`);

			if (block.metadata.title) {
				$$renderer.push(`<!--[0--><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">${$.escape(block.metadata.title)}</h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (block.metadata.subtitle) {
				$$renderer.push(`<!--[0--><p class="mt-4 text-sm font-medium text-muted-foreground">${$.escape(block.metadata.subtitle)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (block.metadata.showViewMore) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					href: block.metadata.redirectsTo || "/products",
					class: 'group',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(block.metadata.viewMoreText)}<svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="intra-gap grid"${$.attr_style(`grid-template-columns: repeat(${$.stringify(block.metadata.columnCount || 5)}, 1fr); row-gap: ${$.stringify(block.metadata.gridRowGap ?? 8)}px; column-gap: ${$.stringify(block.metadata.gridColumnGap ?? 8)}px;`)}>`);

		if (loadingForProducts) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(Array(12));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let _ = each_array[$$index];

				$$renderer.push(`<div class="space-y-4">`);
				Skeleton($$renderer, { class: 'aspect-square w-full rounded-2xl' });
				$$renderer.push(`<!----> <div class="space-y-2">`);
				Skeleton($$renderer, { class: 'h-4 w-3/4' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-1/2' });
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_1 = $.ensure_array_like(products || []);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let p = each_array_1[$$index_1];

				ProductCard($$renderer, {
					product: p,
					hideVariations: true,
					hideCartControls: !block.metadata.showCartControls
				});
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}