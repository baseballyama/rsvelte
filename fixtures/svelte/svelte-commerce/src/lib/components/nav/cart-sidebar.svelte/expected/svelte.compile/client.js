import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CartItem from '$lib/components/cart/cart-item.svelte';
import { X, ShoppingBag } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import { goto } from '$app/navigation';
import { formatPrice } from '$lib/core/utils';
import { getCartState } from '@misiki/kitcommerce-core/stores';
import { cubicOut } from 'svelte/easing';
import { page } from '$app/state';
import { onDestroy, onMount } from 'svelte';
import { dialog } from '$lib/actions/dialog.js';

var root = $.from_html(`<span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground"> </span>`);

var root_1 = $.from_html(
	`<style>body {
					overflow: hidden;
				}</style> <span class="sr-only">Close cart</span>`,
	1
);

var root_2 = $.from_html(`<span class="font-normal text-gray-400"> </span>`);
var root_3 = $.from_html(`<div class="rounded-lg transition-all duration-300 hover:bg-gray-50"><!></div>`);
var root_4 = $.from_html(`<div class="mx-4 flex items-center justify-between"><p class="text-sm font-medium text-gray-700 sm:text-base">Subtotal</p> <p class="text-base font-bold text-gray-900 sm:text-xl"> </p></div> <p class="mx-4 mt-1 text-xs text-gray-400">Shipping &amp; taxes calculated at checkout.</p>`, 1);
var root_5 = $.from_html(`<div class="flex min-h-[80vh] flex-col items-center justify-center gap-3 bg-white"><div class="mb-6 rounded-full bg-gray-50 p-8 ring-1 ring-gray-100"><!></div> <span class="text-xl font-bold uppercase tracking-widest text-gray-900">Empty Cart!!</span> <span class="max-w-xs px-2 text-center text-xs font-medium leading-relaxed text-gray-500">We didn't find any item inside cart, Go ahead, order some essentials from the menu</span> <!></div>`);
var root_6 = $.from_html(`<div class="mx-4 mt-5 pb-6 md:pb-0"><!> <button class="mt-3 w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900">Continue shopping</button></div>`);
var root_7 = $.from_html(`<!> <div class="shadow-3xl ease-out-expo fixed right-0 top-0 z-[10000000] h-screen w-full overflow-y-auto bg-white transition-all duration-500 sm:w-[37.5%]" role="dialog" aria-modal="true" tabindex="-1"><div class="relative z-50 flex h-full flex-col justify-between bg-white p-4"><div class="sm:mx-3"><h2 class="mb-4 mt-4 text-xl font-semibold text-gray-900">Your Cart <!></h2> <!> <!></div> <div><div class="space-y-1"><!></div> <!></div></div></div>`, 1);
var root_8 = $.from_html(`<div class="relative"><button class="flex rounded-full px-2"><!> <!></button> <!></div>`);

export default function Cart_sidebar($$anchor, $$props) {
	const titleId = $.props_id();

	$.push($$props, true);

	const cartState = getCartState();
	const storeData = $.derived(() => page.data?.store);
	const modalHistoryKey = '__svelteCommerceCartSidebar';
	let ownsHistoryEntry = false;
	let isNavigatingFromCart = false;

	// Auto-open the slide-out cart on any successful add/update action.
	// `showCheckout` is flipped to true by the core store's add()/update() on a
	// user action, but is NOT set during initial cart hydration, so watching it
	// opens the drawer on "add to bag" without spurious opens on page load.
	// Seed the baseline to the mount-time value so only a false→true transition
	// that happens while this component is mounted opens the drawer (avoids a
	// spurious open when returning to a shop page while showCheckout is still on).
	let prevShowCheckout = !!cartState?.showCheckout;

	function handleBrowserBack() {
		if (!cartState?.isOpen || !ownsHistoryEntry) return;

		ownsHistoryEntry = false;
		cartState.isOpen = false;
		$$props.onClose?.();
	}

	onMount(() => {
		window.addEventListener('popstate', handleBrowserBack);

		return () => window.removeEventListener('popstate', handleBrowserBack);
	});

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		if (cartState?.isOpen && !ownsHistoryEntry) {
			history.pushState({ ...history.state, [modalHistoryKey]: true }, '', window.location.href);
			ownsHistoryEntry = true;
		} else if (!cartState?.isOpen && ownsHistoryEntry) {
			const isCurrentModalEntry = history.state?.[modalHistoryKey] === true;

			ownsHistoryEntry = false;

			if (isCurrentModalEntry && !isNavigatingFromCart) history.back();

			isNavigatingFromCart = false;
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined' && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
			history.back();
		}
	});

	$.user_effect(() => {
		const showCheckout = !!cartState?.showCheckout;

		if (showCheckout && !prevShowCheckout && cartState && !cartState.isOpen) {
			cartState.isOpen = true;
		}

		prevShowCheckout = showCheckout;
	});

	function slideFadeTopRight(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || cubicOut,
			css: (t, u) => `transform-origin: ${params.transformOrigin || 'top right'}; transform: ${existingTransform} scaleX(${t}); opacity: ${t};`
		};
	}

	async function proceedToCart() {
		isNavigatingFromCart = true;

		if (typeof window !== 'undefined' && history.state?.[modalHistoryKey] === true) {
			const nextState = { ...history.state };

			delete nextState[modalHistoryKey];
			history.replaceState(nextState, '', window.location.href);
		}

		if (cartState) cartState.isOpen = false;

		await goto('/checkout/cart');
	}

	var div = root_8();
	var button = $.child(div);
	var node_1 = $.child(button);

	ShoppingBag(node_1, { class: 'h-5 w-5' });

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, cartState.cart.qty));
			$.append($$anchor, span);
		};

		$.if(node_2, ($$render) => {
			if (cartState?.cart?.total && cartState.cart?.lineItems?.length > 0) $$render(consequent);
		});
	}

	$.reset(button);

	var node_3 = $.sibling(button, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment = root_7();
			var node_4 = $.first_child(fragment);

			Button(node_4, {
				variant: 'ghost',
				class: 'fixed inset-0 z-50 h-svh w-full rounded-none bg-black/30 hover:bg-black/30',
				'aria-label': 'Close cart',
				get onclick() {
					return $$props.onClose;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();

					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_4, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var h2 = $.child(div_3);
			var node_5 = $.sibling($.child(h2));

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_2();
					var text_1 = $.only_child(span_1);

					$.template_effect(() => $.set_text(text_1, `(${cartState.cart.qty ?? ''})`));
					$.append($$anchor, span_1);
				};

				$.if(node_5, ($$render) => {
					if (cartState.cart?.lineItems?.length > 0) $$render(consequent_1);
				});
			}

			$.reset(h2);

			var node_6 = $.sibling(h2, 2);

			Button(node_6, {
				variant: 'ghost',
				size: 'icon',
				class: 'absolute right-4 top-4 rounded-full',
				'aria-label': 'close cart',
				get onclick() {
					return $$props.onClose;
				},

				children: ($$anchor, $$slotProps) => {
					X($$anchor, { class: 'size-5' });
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			$.each(node_7, 17, () => cartState.cart?.lineItems || [], $.index, ($$anchor, _, i) => {
				var div_4 = root_3();
				var node_8 = $.child(div_4);

				CartItem(node_8, {
					get removeItem() {
						return $$props.onRemoveCartItem;
					},

					get cartProduct() {
						return cartState.cart.lineItems[i];
					},

					set cartProduct($$value) {
						cartState.cart.lineItems[i] = $$value;
					}
				});

				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);

			var div_5 = $.sibling(div_3, 2);
			var div_6 = $.child(div_5);
			var node_9 = $.child(div_6);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = root_4();
					var div_7 = $.first_child(fragment_3);
					var p = $.sibling($.child(div_7), 2);
					var text_2 = $.only_child(p, true);

					$.reset(div_7);
					$.next(2);

					$.template_effect(($0) => $.set_text(text_2, $0), [
						() => formatPrice(cartState?.cart?.subtotal ?? cartState?.cart?.total, $.get(storeData)?.currencyCode)
					]);

					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var div_8 = root_5();
					var div_9 = $.child(div_8);
					var node_10 = $.child(div_9);

					ShoppingBag(node_10, { class: 'h-12 w-12 text-gray-300' });
					$.reset(div_9);

					var node_11 = $.sibling(div_9, 6);

					{
						let $0 = $.derived(() => !!cartState.isUpdatingCart);

						Button(node_11, {
							get disabled() {
								return $.get($0);
							},

							get onclick() {
								return $$props.onContinueShopping;
							},
							class: 'mt-8 px-8',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Continue Shopping');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_9, ($$render) => {
					if (cartState.cart?.lineItems?.length > 0) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.reset(div_6);

			var node_12 = $.sibling(div_6, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_10 = root_6();
					var node_13 = $.child(div_10);

					{
						let $0 = $.derived(() => !!cartState.isUpdatingCart);

						Button(node_13, {
							get disabled() {
								return $.get($0);
							},

							onclick: (e) => {
								e.stopPropagation();
								proceedToCart();
							},
							class: 'w-full py-6 text-base font-semibold',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Checkout');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					}

					var button_1 = $.sibling(node_13, 2);

					$.reset(div_10);

					$.delegated('click', button_1, function (...$$args) {
						$$props.onContinueShopping?.apply(this, $$args);
					});

					$.append($$anchor, div_10);
				};

				$.if(node_12, ($$render) => {
					if (cartState.cart?.lineItems?.length > 0) $$render(consequent_3);
				});
			}

			$.reset(div_5);
			$.reset(div_2);
			$.reset(div_1);
			$.action(div_1, ($$node, $$action_arg) => dialog?.($$node, $$action_arg), () => $$props.onClose);

			$.template_effect(() => {
				$.set_attribute(div_1, 'aria-labelledby', titleId);
				$.set_attribute(h2, 'id', titleId);

				$.set_class(div_5, 1, `sticky bottom-0 ${cartState.cart?.lineItems?.length > 0
					? '-mx-4 border-t border-gray-100 bg-gray-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]'
					: ''} py-6 sm:px-4`);
			});

			$.transition(3, div_1, () => slideFadeTopRight, () => ({ duration: 500 }));
			$.append($$anchor, fragment);
		};

		$.if(node_3, ($$render) => {
			if (cartState?.isOpen) $$render(consequent_4);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', `Cart, ${cartState?.cart?.qty ?? 0 ?? ''} items`);
		$.set_attribute(button, 'aria-expanded', !!cartState?.isOpen);
	});

	$.delegated('click', button, () => {
		if (cartState) cartState.isOpen = !cartState.isOpen;
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);