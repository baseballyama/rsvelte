import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { formatPrice } from '$lib/core/utils';

var root = $.from_html(`<div class="text-sm line-through edp-mrp"> </div> <div class="text-lg  px-2 text-success edp-off"> </div>`, 1);
var root_1 = $.from_html(`<div class="intra-gap flex flex-col edp-pricewrap"><div class="gap-1 flex flex-wrap items-baseline lg:flex-nowrap"><div class="text-xl font-semibold  text-gray-900 dark:text-white edp-price"> </div> <!> <span class="w-fit text-sm font-medium text-900 ml-1 edp-tax">Inclusive of all taxes</span></div></div>`);

export default function Product_pricing($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);
	var node = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var div_3 = $.first_child(fragment_1);
					var text_1 = $.only_child(div_3, true);
					var div_4 = $.sibling(div_3, 2);
					var text_2 = $.only_child(div_4);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_1, $0);
							$.set_text(text_2, `${$1 ?? ''}% OFF`);
						},
						[
							() => formatPrice(productState.selectedVariant?.mrp, page?.data?.store?.currency?.code),
							() => Math.round((productState.selectedVariant?.mrp - productState.selectedVariant?.price) / productState.selectedVariant?.mrp * 100)
						]
					);

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (productState.selectedVariant?.mrp && productState.selectedVariant?.mrp > productState.selectedVariant?.price) $$render(consequent);
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = root();
					var div_5 = $.first_child(fragment_3);
					var text_3 = $.only_child(div_5, true);
					var div_6 = $.sibling(div_5, 2);
					var text_4 = $.only_child(div_6);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_3, $0);
							$.set_text(text_4, `${$1 ?? ''}% Off`);
						},
						[
							() => formatPrice(page.data?.product?.mrp, page?.data?.store?.currency?.code),
							() => Math.round((page.data?.product?.mrp - page.data?.product?.price) / page.data?.product?.mrp * 100)
						]
					);

					$.append($$anchor, fragment_3);
				};

				$.if(node_2, ($$render) => {
					if (page.data?.product?.mrp && page.data?.product?.mrp > page.data?.product?.price) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (productState.selectedVariant?.price) $$render(consequent_1); else if (page.data?.product?.price) $$render(consequent_3, 1);
		});
	}

	$.next(2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => formatPrice(productState.selectedVariant?.price || page.data?.product?.price, page?.data?.store?.currency?.code)
	]);

	$.append($$anchor, div);
	$.pop();
}