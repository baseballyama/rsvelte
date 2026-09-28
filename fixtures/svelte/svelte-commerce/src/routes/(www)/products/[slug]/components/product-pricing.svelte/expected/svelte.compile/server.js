import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { formatPrice } from '$lib/core/utils';

export default function Product_pricing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();

		$$renderer.push(`<div class="intra-gap flex flex-col edp-pricewrap"><div class="gap-1 flex flex-wrap items-baseline lg:flex-nowrap"><div class="text-xl font-semibold text-gray-900 dark:text-white edp-price">${$.escape(formatPrice(productState.selectedVariant?.price || page.data?.product?.price, page?.data?.store?.currency?.code))}</div> `);

		if (productState.selectedVariant?.price) {
			$$renderer.push('<!--[0-->');

			if (productState.selectedVariant?.mrp && productState.selectedVariant?.mrp > productState.selectedVariant?.price) {
				$$renderer.push(`<!--[0--><div class="text-sm line-through edp-mrp">${$.escape(formatPrice(productState.selectedVariant?.mrp, page?.data?.store?.currency?.code))}</div> <div class="text-lg px-2 text-success edp-off">${$.escape(Math.round((productState.selectedVariant?.mrp - productState.selectedVariant?.price) / productState.selectedVariant?.mrp * 100))}% OFF</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (page.data?.product?.price) {
			$$renderer.push('<!--[1-->');

			if (page.data?.product?.mrp && page.data?.product?.mrp > page.data?.product?.price) {
				$$renderer.push(`<!--[0--><div class="text-sm line-through edp-mrp">${$.escape(formatPrice(page.data?.product?.mrp, page?.data?.store?.currency?.code))}</div> <div class="text-lg px-2 text-success edp-off">${$.escape(Math.round((page.data?.product?.mrp - page.data?.product?.price) / page.data?.product?.mrp * 100))}% Off</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="w-fit text-sm font-medium text-900 ml-1 edp-tax">Inclusive of all taxes</span></div></div>`);
	});
}