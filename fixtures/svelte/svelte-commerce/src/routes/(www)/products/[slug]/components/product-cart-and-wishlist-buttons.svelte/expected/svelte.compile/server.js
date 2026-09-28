import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button';
import { useProductState } from '$lib/core/composables/index.js';
import { formatPrice } from '$lib/core/utils';

import {
	Check,
	ChevronRight,
	HeartIcon,
	LoaderCircle,
	ShoppingCart,
	MoveRight,
	ShoppingBag
} from '@lucide/svelte';

import { fly } from 'svelte/transition';
import EnquiryModal from '$lib/core/components/plugins/enquiry-modal.svelte';
import { quintOut } from 'svelte/easing';

export default function Product_cart_and_wishlist_buttons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showWishlist = true } = $$props;
		const productState = useProductState();
		const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);
		let showEnquiryModal = false;

		function handleClick() {
			if (productState.cartState?.showCheckout) productState.cartState.isOpen = true; else productState.handleAddToCart();
		}

		function wishlistButton($$renderer) {
			if (showWishlist && productState.wishlistPluginEnabled) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					class: 'h-full w-[4rem] edp-wish',
					onclick: productState.handleWishlistClick,
					'aria-label': 'Add to wishlist',
					children: ($$renderer) => {
						if (productState.wishlistLoading) {
							$$renderer.push('<!--[0-->');
							LoaderCircle($$renderer, { class: 'h-7 w-7 animate-spin text-primary' });
						} else {
							$$renderer.push('<!--[-1-->');

							HeartIcon($$renderer, {
								class: `!h-6 !w-6 stroke-[1.3] ${productState.wishlisted
									? 'scale-110 fill-red-500 text-red-500'
									: 'text-gray-900'} transition-transform duration-300`
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (productState.showAddToCartMessage) {
			$$renderer.push(`<!--[0--><div class="fixed hidden md:block right-4 top-24 z-[100] w-full max-w-sm rounded-lg border border-gray-100 bg-white p-4 shadow-2xl edp-toast"><div class="flex items-center gap-4"><div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50"><img${$.attr('src', productState.selectedVariant?.image || page.data?.product?.thumbnail)} alt="Product" class="h-full w-full object-contain"/></div> <div class="flex flex-1 flex-col gap-1"><p class="text-xs font-bold uppercase tracking-tight text-gray-900">Added to Bag</p> <p class="line-clamp-1 text-[11px] text-gray-500">${$.escape(page.data?.product?.title)}</p> <p class="text-xs font-bold text-primary">${$.escape(formatPrice(productState.selectedVariant?.price, page?.data?.store?.currency?.code))}</p></div> `);

			Button($$renderer, {
				size: 'sm',
				class: 'px-4',
				onclick: () => {
					if (productState.cartState) productState.cartState.isOpen = true;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->View Bag`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex h-[4rem] items-center gap-4 lg:h-[3rem]"><div class="flex-1 h-full">`);

		if (enquiryPlugin()?.active) {
			$$renderer.push('<!--[0-->');

			EnquiryModal($$renderer, {
				onClose: () => showEnquiryModal = false,
				isOpen: showEnquiryModal,
				productId: page.data?.product?.id,
				productTitle: page.data?.product?.title
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: () => showEnquiryModal = true,
				class: 'h-full w-full edp-atc',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(enquiryPlugin()?.buttonText || 'Enquire')}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex h-full w-full gap-2">`);

			Button($$renderer, {
				class: `edp-atc h-full flex justify-center items-center gap-2 text-base flex-1 uppercase font-semibold ${productState.cartState?.addToCartMessage == 'Added to cart' ? 'bg-green-600 hover:bg-green-700' : ''}`,
				size: 'lg',
				disabled: productState.addToCartButtonDisabled,
				onclick: handleClick,
				children: ($$renderer) => {
					if (!productState.isLoading && (!page.data?.product?.manageInventory
						? false
						: productState.anyVariantStockThere
							? productState.selectedVariant?.manageInventory && !productState.selectedVariant?.stock
							: !page.data?.product.stock)) {
						$$renderer.push(`<!--[0-->Out of Stock`);
					} else if (productState.cartState?.showCheckout) {
						$$renderer.push(`<!--[1-->Go to bag `);
						ChevronRight($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
						ShoppingBag($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!----> <span>Add to bag</span>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div> `);
		wishlistButton($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}