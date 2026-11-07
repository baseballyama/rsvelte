import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { onDestroy, onMount } from 'svelte';
import { slide } from 'svelte/transition';
import { getCartState } from '$lib/core/stores/index.js';
import { ArrowLeft, Compass, Grid, Heart, Home, Play, ShoppingBag } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import { Separator } from '$lib/components/ui/separator';
import { cn, formatPrice } from '$lib/core/utils';
import CartItem from '$lib/components/cart/cart-item.svelte';

export default function Bottom_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '' } = $$props;
		const cartState = getCartState();
		let showCartModal = false;
		const modalHistoryKey = '__svelteCommerceBottomCart';
		let ownsHistoryEntry = false;

		function handleBrowserBack() {
			if (!showCartModal || !ownsHistoryEntry) return;

			ownsHistoryEntry = false;
			showCartModal = false;
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

		const navItems = $.derived(() => {
			const items = [
				{ label: 'Home', icon: Home, href: '/' },
				{ label: 'Explore', icon: Compass, href: '/products' },
				{ label: 'Wishlist', icon: Heart, href: '/my/wishlist' },
				{ label: 'Categories', icon: Grid, href: '/categories' },
				{
					label: 'Cart',
					icon: ShoppingBag,
					onClick: () => {
						showCartModal = true;
					}
				}
			];

			if (page?.data?.store?.plugins?.isReel?.active) {
				items.splice(4, 0, { label: 'Reels', icon: Play, href: '/reels' });
			}

			return items;
		});

		function isActive(href) {
			return page.url.pathname === href;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<nav${$.attr_class($.clsx(cn('pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white font-sans md:hidden', className)))}><div class="flex h-16 items-center justify-around px-3"><!--[-->`);

			const each_array = $.ensure_array_like(navItems());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				if (item.href) {
					$$renderer.push(`<!--[0--><a${$.attr('href', item.href)} class="relative flex h-full flex-1 flex-col items-center justify-center transition-all duration-200"><div${$.attr_class(`relative flex h-7 w-7 items-center justify-center transition-colors duration-200 ${isActive(item.href) ? 'text-primary' : 'text-gray-600'}`)}>`);

					if (item.icon) {
						$$renderer.push('<!--[-->');
						item.icon($$renderer, { size: 20, class: 'stroke-[1.6]' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <span${$.attr_class(`truncate text-[9px] font-bold uppercase tracking-wider transition-colors duration-200 ${isActive(item.href) ? 'font-black text-black' : 'text-gray-600'}`)}>${$.escape(item.label)}</span> `);

					if (isActive(item.href)) {
						$$renderer.push(`<!--[0--><span class="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary"></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></a>`);
				} else {
					$$renderer.push(`<!--[-1--><button class="flex h-full flex-1 flex-col items-center justify-center transition-all duration-200"><div class="relative flex h-7 w-7 items-center justify-center text-gray-600">`);

					if (item.icon) {
						$$renderer.push('<!--[-->');
						item.icon($$renderer, { size: 20, class: 'stroke-[1.6]' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (cartState?.cart?.total && cartState.cart?.lineItems?.length > 0) {
						$$renderer.push(`<!--[0--><span class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-primary text-[8px] font-bold text-black">${$.escape(cartState?.cart?.qty)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <span class="truncate text-[9px] font-bold uppercase tracking-wider text-gray-600">${$.escape(item.label)}</span></button>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></nav> `);

			if (showCartModal) {
				$$renderer.push(`<!--[0--><div class="fixed inset-0 z-[1000001] bg-white"><div class="flex h-full flex-col"><header class="flex items-center gap-4 border-b p-4">`);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon',
					class: 'rounded-full',
					onclick: () => showCartModal = false,
					children: ($$renderer) => {
						ArrowLeft($$renderer, { size: 24 });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <h2 class="text-lg font-medium">Your Cart</h2></header> <div class="flex-1 overflow-auto p-4">`);

				if (cartState?.cart?.lineItems?.length) {
					$$renderer.push(`<!--[0--><div class="space-y-4"><!--[-->`);

					const each_array_1 = $.ensure_array_like(cartState.cart.lineItems || []);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let _ = each_array_1[i];

						$$renderer.push(`<div class="rounded-lg border border-gray-100 p-2 transition-all duration-300 hover:bg-gray-50">`);

						CartItem($$renderer, {
							removeItem: () => {},
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

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex h-full flex-col items-center justify-center"><p class="mb-4 text-gray-500">Your cart is empty</p> `);

					Button($$renderer, {
						onclick: () => {
							showCartModal = false;
							goto('/products');
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Continue Shopping`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (cartState?.cart?.lineItems?.length) {
					$$renderer.push(`<!--[0--><div class="border-t bg-white p-4"><div class="space-y-4"><div class="flex justify-between text-sm"><span>Subtotal</span> <span>${$.escape(formatPrice(cartState.cart.subtotal, cartState.cart.currencyCode))}</span></div> <div class="flex justify-between text-sm"><span>Shipping</span> <span>Calculated at checkout</span></div> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> <div class="flex justify-between font-medium"><span>Total</span> <span>${$.escape(formatPrice(cartState.cart.total, cartState.cart.currencyCode))}</span></div> `);

					Button($$renderer, {
						onclick: () => {
							showCartModal = false;
							goto('/checkout/cart');
						},
						size: 'lg',
						class: 'w-full rounded-pill bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors duration-300 hover:bg-emerald-900',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Proceed to Checkout`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="h-16 md:hidden"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}