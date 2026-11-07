import * as $ from 'svelte/internal/server';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { FeaturedProductsGrid } from '$lib/core/composables/index.js';

export default function Featured_products_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			data,
			displayProduct,
			loadMore,
			hasMore = false,
			loading = false
		} = $$props;

		const featuredProductGrid = new FeaturedProductsGrid({ loadMore, loading, hasMore });

		if (data?.length === 0) {
			$$renderer.push(`<!--[0--><div class="flex h-full items-center justify-center"><div class="text-center"><h2 class="text-2xl font-semibold tracking-tight">No products found</h2></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="intra-gap grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"><!--[-->`);

			const each_array = $.ensure_array_like(data || []);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let p = each_array[$$index];

				Product($$renderer, {
					product: p,
					displayProduct,
					hideVariations: true,
					hideCartControls: true
				});
			}

			$$renderer.push(`<!--]--></div> `);

			if (hasMore || loading) {
				$$renderer.push(`<!--[0--><div class="mt-4 flex justify-center">`);

				if (loading) {
					$$renderer.push(`<!--[0--><div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}