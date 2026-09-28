import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import { useProductState } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="flex justify-center py-8"><div class="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div></div>`);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-1 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 edp-related-grid"></div>`);
var root_2 = $.from_html(`<div class="mx-2 mb-20 mt-4 edp-related"><header class="edp-related-head"><span class="edp-related-eyebrow">More to explore</span> <h2 class="my-4 text-center text-2xl font-bold edp-related-title">Related Products</h2></header> <!></div>`);

export default function Related_products($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();
			var node_1 = $.sibling($.child(div), 2);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();

					$.each(div_2, 21, () => productState.productsOfSameCategory, $.index, ($$anchor, $$item) => {
						let id = () => $.get($$item).id;
						let slug = () => $.get($$item).slug;
						let thumbnail = () => $.get($$item).thumbnail;
						let price = () => $.get($$item).price;
						let mrp = () => $.get($$item).mrp;
						let title = () => $.get($$item).title;
						let vendor = () => $.get($$item).vendor;
						let variants = () => $.get($$item).variants;

						{
							let $0 = $.derived(() => ({
								id: id(),
								slug: slug(),
								thumbnail: thumbnail(),
								price: price(),
								mrp: mrp(),
								title: title(),
								vendor: vendor(),
								variants: variants()
							}));

							ProductCard($$anchor, {
								get product() {
									return $.get($0);
								},
								aspectRatio: 'square'
							});
						}
					});

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (productState.isLoadingRelatedProducts) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (productState.isLoadingRelatedProducts || productState.productsOfSameCategory.length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}