import * as $ from 'svelte/internal/server';
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

export default function Cart_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const titleId = $.props_id($$renderer);
		const cartState = getCartState();
		const storeData = $.derived(() => page.data?.store);
		const { onClose, onContinueShopping, onRemoveCartItem } = $$props;
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
			onClose?.();
		}

		onMount(() => {
			window.addEventListener('popstate', handleBrowserBack);

			return () => window.removeEventListener('popstate', handleBrowserBack);
		});

		onDestroy(() => {
			if (typeof window !== 'undefined' && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
				history.back();
			}
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="relative"><button class="flex rounded-full px-2"${$.attr('aria-label', `Cart, ${$.stringify(cartState?.cart?.qty ?? 0)} items`)}${$.attr('aria-expanded', !!cartState?.isOpen)}>`);
			ShoppingBag($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);

			if (cartState?.cart?.total && cartState.cart?.lineItems?.length > 0) {
				$$renderer.push(`<!--[0--><span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground">${$.escape(cartState.cart.qty)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button> `);

			if (cartState?.isOpen) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'ghost',
					class: 'fixed inset-0 z-50 h-svh w-full rounded-none bg-black/30 hover:bg-black/30',
					'aria-label': 'Close cart',
					onclick: onClose,
					children: ($$renderer) => {
						$$renderer.push(`<style>
				body {
					overflow: hidden;
				}
			</style>`);

						$$renderer.push(` <span class="sr-only">Close cart</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="shadow-3xl ease-out-expo fixed right-0 top-0 z-[10000000] h-screen w-full overflow-y-auto bg-white transition-all duration-500 sm:w-[37.5%]" role="dialog" aria-modal="true"${$.attr('aria-labelledby', titleId)} tabindex="-1"><div class="relative z-50 flex h-full flex-col justify-between bg-white p-4"><div class="sm:mx-3"><h2${$.attr('id', titleId)} class="mb-4 mt-4 text-xl font-semibold text-gray-900">Your Cart `);

				if (cartState.cart?.lineItems?.length > 0) {
					$$renderer.push(`<!--[0--><span class="font-normal text-gray-400">(${$.escape(cartState.cart.qty)})</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></h2> `);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon',
					class: 'absolute right-4 top-4 rounded-full',
					'aria-label': 'close cart',
					onclick: onClose,
					children: ($$renderer) => {
						X($$renderer, { class: 'size-5' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(cartState.cart?.lineItems || []);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					$$renderer.push(`<div class="rounded-lg transition-all duration-300 hover:bg-gray-50">`);

					CartItem($$renderer, {
						removeItem: onRemoveCartItem,
						get cartProduct() {
							return cartState.cart.lineItems[i];
						},

						set cartProduct($$value) {
							cartState.cart.lineItems[i] = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div> <div${$.attr_class(`sticky bottom-0 ${cartState.cart?.lineItems?.length > 0
					? '-mx-4 border-t border-gray-100 bg-gray-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]'
					: ''} py-6 sm:px-4`)}><div class="space-y-1">`);

				if (cartState.cart?.lineItems?.length > 0) {
					$$renderer.push(`<!--[0--><div class="mx-4 flex items-center justify-between"><p class="text-sm font-medium text-gray-700 sm:text-base">Subtotal</p> <p class="text-base font-bold text-gray-900 sm:text-xl">${$.escape(formatPrice(cartState?.cart?.subtotal ?? cartState?.cart?.total, storeData()?.currencyCode))}</p></div> <p class="mx-4 mt-1 text-xs text-gray-400">Shipping &amp; taxes calculated at checkout.</p>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex min-h-[80vh] flex-col items-center justify-center gap-3 bg-white"><div class="mb-6 rounded-full bg-gray-50 p-8 ring-1 ring-gray-100">`);
					ShoppingBag($$renderer, { class: 'h-12 w-12 text-gray-300' });
					$$renderer.push(`<!----></div> <span class="text-xl font-bold uppercase tracking-widest text-gray-900">Empty Cart!!</span> <span class="max-w-xs px-2 text-center text-xs font-medium leading-relaxed text-gray-500">We didn't find any item inside cart, Go ahead, order some essentials from the menu</span> `);

					Button($$renderer, {
						disabled: !!cartState.isUpdatingCart,
						onclick: onContinueShopping,
						class: 'mt-8 px-8',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Continue Shopping`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (cartState.cart?.lineItems?.length > 0) {
					$$renderer.push(`<!--[0--><div class="mx-4 mt-5 pb-6 md:pb-0">`);

					Button($$renderer, {
						disabled: !!cartState.isUpdatingCart,
						onclick: (e) => {
							e.stopPropagation();
							proceedToCart();
						},
						class: 'w-full py-6 text-base font-semibold',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Checkout`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <button class="mt-3 w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900">Continue shopping</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}