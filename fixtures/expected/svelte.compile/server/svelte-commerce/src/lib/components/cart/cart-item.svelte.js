import * as $ from 'svelte/internal/server';
import { getCartState, getUserState } from '$lib/core/stores/index.js';
import { Minus, Plus, Trash } from '@lucide/svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import LoadingDotsGif from '$lib/assets/dots-loading.gif';
import { formatPrice, fireGTagEvent } from '$lib/core/utils/index.js';
import { page } from '$app/state';

export default function Cart_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cartState = getCartState();
		const userState = getUserState();
		let loading = false;
		let { cartProduct = void 0, removeItem } = $$props;
		let totalPrice = $.derived(() => (cartProduct?.price || 0) * (cartProduct?.qty || 0));

		$$renderer.push(`<div class="flex items-center justify-between py-4" role="group"><div class="flex gap-4 w-full"><a${$.attr('href', `/products/${$.stringify(cartProduct?.slug)}`)} class="block shrink-0"><div class="overflow-hidden bg-gray-50 p-1 ring-1 ring-gray-100">`);

		LazyImg($$renderer, {
			src: cartProduct?.thumbnail,
			alt: cartProduct?.title || 'Product',
			class: 'aspect-[3/4] w-24 object-contain sm:w-20'
		});

		$$renderer.push(`<!----></div></a> <div class="flex flex-1 flex-col"><div class="flex flex-col gap-1"><a${$.attr('href', `/products/${$.stringify(cartProduct?.slug)}`)}><h4 class="line-clamp-2 text-base font-semibold text-gray-900">${$.escape(cartProduct?.title)}</h4></a> <div class="flex justify-start items-center gap-2"><p class="text-base font-bold pt-1 text-gray-900">${$.escape(formatPrice(totalPrice(), page?.data?.store?.currency?.code))}</p> `);

		if (cartProduct.qty > 1) {
			$$renderer.push(`<!--[0--><p class="text-sm font-semibold text-muted uppercase tracking-tighter">(${$.escape(formatPrice(cartProduct.price, page?.data?.store?.currency?.code))} each)</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (cartProduct?.variantTitle) {
			$$renderer.push(`<!--[0--><p class="text-xs font-medium text-gray-500">${$.escape(cartProduct.variantTitle)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="mt-4 flex items-center gap-4"><div class="flex items-center gap-2"><div class="flex items-center rounded-md border border-gray-200 bg-white p-0.5 shadow-sm"><button class="rounded-md p-1 hover:bg-gray-100 disabled:opacity-30" aria-label="Subtract 1 from qty"${$.attr('disabled', loading || cartProduct.qty <= 1, true)}>`);
		Minus($$renderer, { class: 'size-3.5' });
		$$renderer.push(`<!----></button> <span class="flex min-w-[2rem] items-center justify-center text-xs font-bold text-gray-900">`);

		if (loading) {
			$$renderer.push(`<!--[0--><img${$.attr('src', LoadingDotsGif)} alt="Loading..." class="size-3.5"/>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(cartProduct.qty)}`);
		}

		$$renderer.push(`<!--]--></span> <button class="rounded-md p-1 hover:bg-gray-100 disabled:opacity-30" aria-label="Add 1 to qty"${$.attr('disabled', loading, true)}>`);
		Plus($$renderer, { class: 'size-3.5' });
		$$renderer.push(`<!----></button></div> <button class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50" aria-label="Remove item">`);
		Trash($$renderer, { class: 'size-4' });
		$$renderer.push(`<!----></button></div></div></div></div></div>`);
		$.bind_props($$props, { cartProduct });
	});
}