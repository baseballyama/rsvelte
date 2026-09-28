import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { onMount } from 'svelte';
import { Plus } from '@lucide/svelte';
import { page } from '$app/state';
import { orderService } from '$lib/core/services/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cartState = getCartState();
		let data = [];

		onMount(async () => {
			data = await orderService.buyAgain();
		});

		$.head('o687ox', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Buy Again</title>`);
			});
		});

		$$renderer.push(`<section class="flex flex-col gap-10"><h3 class="capitalize">Orders</h3> <div class="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0"><div class="col-span-2 flex flex-col divide-y">`);

		if (data.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(data);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<div class="hidden gap-2 p-5 md:flex lg:gap-5"><a${$.attr('href', `/product/${item.slug}?variant_id=${item.variantId || ''}`)} aria-label="Click to view the product details" class="shrink-0">`);

				LazyImg($$renderer, {
					src: item.img,
					alt: item.title,
					width: '56',
					class: 'h-auto w-14 object-contain object-top'
				});

				$$renderer.push(`<!----></a> <div class="ml-4 flex w-full flex-1 flex-col gap-0.5 pl-4 pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a${$.attr('href', `/product/${item.slug}?variant_id=${item.variantId || ''}`)} aria-label="Click to view the product details" class="flex-1 hover:underline"><p>${$.escape(item.title)}</p></a></div> `);

				if (item.qty) {
					$$renderer.push(`<!--[0--><span>Qty : <span class="font-semibold">${$.escape(item.qty)}</span></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex flex-wrap items-center gap-1">Total : <span class="text-primary-700 whitespace-nowrap font-bold">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))}</span></div> <div class="relative z-10 flex w-full items-center justify-center p-0 opacity-100 duration-300 laptop:absolute laptop:bottom-0 laptop:translate-y-full laptop:transform laptop:opacity-0 laptop:transition-all laptop:group-hover:translate-y-0 laptop:group-hover:opacity-100">`);

				if (cartState?.cart?.lineItems?.some((item1) => item1.productId === item.productId)) {
					$$renderer.push(`<!--[0--><div>Item already in cart</div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						disabled: !!cartState?.isUpdatingCart,
						variant: 'outline',
						class: 'w-full',
						onclick: () => {
							cartState?.add({
								qty: item.qty,
								productId: item.productId,
								variantId: item.variantId
							});
						},

						children: ($$renderer) => {
							Plus($$renderer, { class: 'mr-2 max-h-4 max-w-4' });
							$$renderer.push(`<!----> Add to cart`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div></div></div> <div class="block gap-2 p-5 md:hidden lg:gap-5"><div class="flex items-center justify-between"><div><a${$.attr('href', `/product/${item.slug}?variant_id=${item.variantId || ''}`)} aria-label="Click to view the product details" class="shrink-0">`);

				LazyImg($$renderer, {
					src: item.img,
					alt: item.title,
					width: '56',
					class: 'h-auto w-14 object-contain object-top'
				});

				$$renderer.push(`<!----></a></div> <div class="mt-2 flex w-full flex-1 flex-col items-center justify-between gap-0.5 pt-1 xl:pl-4 xl:pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a${$.attr('href', `/product/${item.slug}?variant_id=${item.variantId || ''}`)} aria-label="Click to view the product details" class="flex-1 hover:underline"><p>${$.escape(item.title)}</p></a></div> `);

				if (item.qty) {
					$$renderer.push(`<!--[0--><span>Qty : <span class="font-semibold">${$.escape(item.qty)}</span></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex flex-wrap items-center gap-1">Total : <span class="text-primary-700 whitespace-nowrap font-bold">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))}</span></div> <div class="relative z-10 flex w-full items-center justify-center p-0 opacity-100 duration-300 laptop:absolute laptop:bottom-0 laptop:translate-y-full laptop:transform laptop:opacity-0 laptop:transition-all laptop:group-hover:translate-y-0 laptop:group-hover:opacity-100">`);

				if (cartState?.cart?.lineItems?.some((item1) => item1.productId === item.productId)) {
					$$renderer.push(`<!--[0--><div>Item already in cart</div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						disabled: !!cartState?.isUpdatingCart,
						variant: 'outline',
						class: 'w-full',
						onclick: () => {
							cartState?.add({
								qty: item.qty,
								productId: item.productId,
								variantId: item.variantId
							});
						},

						children: ($$renderer) => {
							Plus($$renderer, { class: 'mr-2 max-h-4 max-w-4' });
							$$renderer.push(`<!----> Add to cart`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div></div></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><p>No orders found</p>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}