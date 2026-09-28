import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { FeaturedProductsGrid } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="flex h-full items-center justify-center"><div class="text-center"><h2 class="text-2xl font-semibold tracking-tight">No products found</h2></div></div>`);
var root_1 = $.from_html(`<div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>`);
var root_2 = $.from_html(`<div class="mt-4 flex justify-center"><!></div>`);
var root_3 = $.from_html(`<div class="intra-gap grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"></div> <!>`, 1);

export default function Featured_products_grid($$anchor, $$props) {
	$.push($$props, true);

	let hasMore = $.prop($$props, 'hasMore', 3, false),
		loading = $.prop($$props, 'loading', 3, false);

	const featuredProductGrid = new FeaturedProductsGrid({
		loadMore: $$props.loadMore,
		loading: loading(),
		hasMore: hasMore()
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var div_1 = $.first_child(fragment_1);

			$.each(div_1, 21, () => $$props.data || [], $.index, ($$anchor, p) => {
				Product($$anchor, {
					get product() {
						return $.get(p);
					},

					get displayProduct() {
						return $$props.displayProduct;
					},
					hideVariations: true,
					hideCartControls: true
				});
			});

			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_2();
					var node_2 = $.child(div_2);

					{
						var consequent_1 = ($$anchor) => {
							var div_3 = root_1();

							$.append($$anchor, div_3);
						};

						$.if(node_2, ($$render) => {
							if (loading()) $$render(consequent_1);
						});
					}

					$.reset(div_2);
					$.bind_this(div_2, ($$value) => featuredProductGrid.loadMoreTrigger = $$value, () => featuredProductGrid?.loadMoreTrigger);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (hasMore() || loading()) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.data?.length === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}