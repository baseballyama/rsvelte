import * as $ from 'svelte/internal/server';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import { useProductState } from '$lib/core/composables/index.js';

export default function Related_products($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();

		if (productState.isLoadingRelatedProducts || productState.productsOfSameCategory.length > 0) {
			$$renderer.push(`<!--[0--><div class="mx-2 mb-20 mt-4 edp-related"><header class="edp-related-head"><span class="edp-related-eyebrow">More to explore</span> <h2 class="my-4 text-center text-2xl font-bold edp-related-title">Related Products</h2></header> `);

			if (productState.isLoadingRelatedProducts) {
				$$renderer.push(`<!--[0--><div class="flex justify-center py-8"><div class="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="grid grid-cols-2 gap-1 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 edp-related-grid"><!--[-->`);

				const each_array = $.ensure_array_like(productState.productsOfSameCategory);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { id, slug, thumbnail, price, mrp, title, vendor, variants } = each_array[$$index];

					ProductCard($$renderer, {
						product: { id, slug, thumbnail, price, mrp, title, vendor, variants },
						aspectRatio: 'square'
					});
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}