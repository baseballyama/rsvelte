import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="fixed hidden md:block right-4 top-24 z-[100] w-full max-w-sm rounded-lg border border-gray-100 bg-white p-4 shadow-2xl edp-toast"><div class="flex items-center gap-4"><div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50"><img alt="Product" class="h-full w-full object-contain"/></div> <div class="flex flex-1 flex-col gap-1"><p class="text-xs font-bold uppercase tracking-tight text-gray-900">Added to Bag</p> <p class="line-clamp-1 text-[11px] text-gray-500"> </p> <p class="text-xs font-bold text-primary"> </p></div> <!></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Go to bag <!>`, 1);
var root_3 = $.from_html(`<!> <span>Add to bag</span>`, 1);
var root_4 = $.from_html(`<div class="flex h-full w-full gap-2"><!></div>`);
var root_5 = $.from_html(`<!> <div class="flex h-[4rem] items-center gap-4 lg:h-[3rem]"><div class="flex-1 h-full"><!></div> <!></div>`, 1);

export default function Product_cart_and_wishlist_buttons($$anchor, $$props) {
	$.push($$props, true);

	const wishlistButton = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				Button($$anchor, {
					variant: 'outline',
					size: 'icon',
					class: 'h-full w-[4rem] edp-wish',
					get onclick() {
						return productState.handleWishlistClick;
					},
					'aria-label': 'Add to wishlist',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								LoaderCircle($$anchor, { class: 'h-7 w-7 animate-spin text-primary' });
							};

							var alternate = ($$anchor) => {
								{
									let $0 = $.derived(() => productState.wishlisted
										? 'scale-110 fill-red-500 text-red-500'
										: 'text-gray-900');

									HeartIcon($$anchor, {
										get class() {
											return `!h-6 !w-6 stroke-[1.3] ${$.get($0) ?? ''} transition-transform duration-300`;
										}
									});
								}
							};

							$.if(node_1, ($$render) => {
								if (productState.wishlistLoading) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			};

			$.if(node, ($$render) => {
				if (showWishlist() && productState.wishlistPluginEnabled) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment);
	};

	const showWishlist = $.prop($$props, 'showWishlist', 3, true);
	const productState = useProductState();
	const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);
	let showEnquiryModal = $.state(false);

	function handleClick() {
		if (productState.cartState?.showCheckout) productState.cartState.isOpen = true; else productState.handleAddToCart();
	}

	var fragment_5 = root_5();
	var node_2 = $.first_child(fragment_5);

	{
		var consequent_2 = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var img = $.only_child(div_2);
			var div_3 = $.sibling(div_2, 2);
			var p = $.sibling($.child(div_3), 2);
			var text = $.only_child(p, true);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1, true);

			$.reset(div_3);

			var node_3 = $.sibling(div_3, 2);

			Button(node_3, {
				size: 'sm',
				class: 'px-4',
				onclick: () => {
					if (productState.cartState) productState.cartState.isOpen = true;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('View Bag');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_attribute(img, 'src', productState.selectedVariant?.image || page.data?.product?.thumbnail);
					$.set_text(text, page.data?.product?.title);
					$.set_text(text_1, $0);
				},
				[
					() => formatPrice(productState.selectedVariant?.price, page?.data?.store?.currency?.code)
				]
			);

			$.transition(3, div, () => fly, () => ({ x: 50, duration: 300, easing: quintOut }));
			$.append($$anchor, div);
		};

		$.if(node_2, ($$render) => {
			if (productState.showAddToCartMessage) $$render(consequent_2);
		});
	}

	var div_4 = $.sibling(node_2, 2);
	var div_5 = $.child(div_4);
	var node_4 = $.child(div_5);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_6 = root_1();
			var node_5 = $.first_child(fragment_6);

			{
				let $0 = $.derived(() => page.data?.product?.id);
				let $1 = $.derived(() => page.data?.product?.title);

				EnquiryModal(node_5, {
					onClose: () => $.set(showEnquiryModal, false),
					get isOpen() {
						return $.get(showEnquiryModal);
					},

					get productId() {
						return $.get($0);
					},

					get productTitle() {
						return $.get($1);
					}
				});
			}

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				onclick: () => $.set(showEnquiryModal, true),
				class: 'h-full w-full edp-atc',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, $.get(enquiryPlugin)?.buttonText || 'Enquire'));
					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		};

		var alternate_2 = ($$anchor) => {
			var div_6 = root_4();
			var node_7 = $.child(div_6);

			{
				let $0 = $.derived(() => productState.cartState?.addToCartMessage == 'Added to cart' ? 'bg-green-600 hover:bg-green-700' : '');

				Button(node_7, {
					get class() {
						return `edp-atc h-full flex justify-center items-center gap-2 text-base flex-1 uppercase font-semibold ${$.get($0) ?? ''}`;
					},
					size: 'lg',
					get disabled() {
						return productState.addToCartButtonDisabled;
					},
					onclick: handleClick,
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						{
							var consequent_4 = ($$anchor) => {
								var text_4 = $.text('Out of Stock');

								$.append($$anchor, text_4);
							};

							var consequent_5 = ($$anchor) => {
								var fragment_9 = root_2();
								var node_9 = $.sibling($.first_child(fragment_9));

								ChevronRight(node_9, { class: 'h-5 w-5' });
								$.append($$anchor, fragment_9);
							};

							var alternate_1 = ($$anchor) => {
								var fragment_10 = root_3();
								var node_10 = $.first_child(fragment_10);

								ShoppingBag(node_10, { class: 'h-5 w-5' });
								$.next(2);
								$.append($$anchor, fragment_10);
							};

							$.if(node_8, ($$render) => {
								if (!productState.isLoading && (!page.data?.product?.manageInventory
									? false
									: productState.anyVariantStockThere
										? productState.selectedVariant?.manageInventory && !productState.selectedVariant?.stock
										: !page.data?.product.stock)) $$render(consequent_4); else if (productState.cartState?.showCheckout) $$render(consequent_5, 1); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_4, ($$render) => {
			if ($.get(enquiryPlugin)?.active) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_5);

	var node_11 = $.sibling(div_5, 2);

	wishlistButton(node_11);
	$.reset(div_4);
	$.append($$anchor, fragment_5);
	$.pop();
}