import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';

import {
	Check,
	Loader,
	LoaderCircle,
	LockKeyhole,
	Minus,
	Plus,
	ShoppingBag,
	Tag,
	Trash,
	X
} from '@lucide/svelte';

import { formatPrice } from '$lib/core/utils';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { page } from '$app/state';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import { goto } from '$app/navigation';
import { ChevronRight } from '@lucide/svelte';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import CouponsDrawer from '$lib/components/coupon/coupons-drawer.svelte';
import { CartModule } from '$lib/core/composables/index.js';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';
import { toast } from 'svelte-sonner';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const cartModule = new CartModule();
		const cartState = cartModule.cartState;

		// Keyed by line id, matching the store: cart.svelte.js resolves `lineId = cart_item?.id` and
		// flips `updatingItem[lineId]` around each mutation. Wrapped in a typed accessor because the
		// connector's CartLineItem type resolves without its own fields in this file — the same drift
		// that makes `item.qty`, `item.price` and `item.mrp` error throughout.
		// `any` on purpose: the connector's CartLineItem type resolves without its own fields in this
		// file, so a structural type here is rejected as having "no properties in common" with it.
		const isUpdating = (item) => !!cartState.updatingItem[item?.id];

		// Removing a line is one tap with no dialog, so offer an undo instead of a blocking confirm.
		function removeItem(e, item) {
			cartModule.removeItem(e, item);

			toast('Removed from your bag', {
				action: {
					label: 'Undo',
					onClick: () => cartState?.add({
						qty: item.qty,
						productId: item.productId,
						variantId: item.variantId
					})
				}
			});
		}

		const totalSavings = $.derived(() => (cartState.cart?.lineItems || []).reduce((acc, item) => acc + Math.max(0, (item.mrp || item.price) - item.price) * item.qty, 0) + (cartState.cart?.discountAmount || 0));
		const animatedSavings = tweened(0, { duration: 1000, easing: cubicOut });

		function quantitySelector($$renderer, item) {
			$$renderer.push(`<div class="flex items-center rounded-radius border border-border bg-background p-1 shadow-sm transition-all duration-300 hover:shadow-md">`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				onclick: (e) => cartModule.decreaseQty(e, item),
				disabled: isUpdating(item) || item.qty <= 1,
				class: 'flex h-7 w-7 items-center justify-center',
				'aria-label': 'Decrease quantity',
				children: ($$renderer) => {
					Minus($$renderer, { class: 'size-3 text-gray-900' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <span class="flex min-w-[2.5rem] items-center justify-center px-1 text-xs font-bold text-gray-900">`);

			if (isUpdating(item)) {
				$$renderer.push('<!--[0-->');
				LoadingDots($$renderer, {});
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(item.qty)}`);
			}

			$$renderer.push(`<!--]--></span> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'flex h-7 w-7 items-center justify-center',
				'aria-label': 'Increase quantity',
				disabled: isUpdating(item),
				onclick: (e) => cartModule.increaseQty(e, item),
				children: ($$renderer) => {
					Plus($$renderer, { class: 'size-3 text-gray-900' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('192krp', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Cart - ${$.escape(page?.data?.store?.name || '')}</title>`);
				});
			});

			$$renderer.push(`<div class="min-h-screen py-8"><div class="container mx-auto px-4">`);
			CheckoutHeader($$renderer, { step: 1 });
			$$renderer.push(`<!---->  `);

			$.await(
				$$renderer,
				cartState.hasLoaded,
				() => {
					$$renderer.push(`<div class="flex min-h-96 items-center justify-center py-8">`);
					LoaderCircle($$renderer, { class: 'animate-spin' });
					$$renderer.push(`<!----></div>`);
				},
				(_) => {
					if (!cartState.cart?.lineItems?.length) {
						$$renderer.push(`<!--[0--><div class="flex h-[60vh] flex-col items-center justify-center text-center"><div class="mb-6 rounded-full bg-gray-50 p-8 ring-1 ring-gray-100">`);
						ShoppingBag($$renderer, { class: 'h-12 w-12 text-gray-300' });
						$$renderer.push(`<!----></div> <h2 class="mb-2 text-xl font-bold uppercase tracking-widest text-gray-900">Your bag is empty</h2> <p class="mb-8 max-w-xs text-sm text-gray-500">Looks like you haven't added anything to your bag yet.</p> `);

						Button($$renderer, {
							href: '/',
							variant: 'default',
							class: 'rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.2em]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Start Shopping`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div>`);

						if (totalSavings() > 0) {
							$$renderer.push(`<!--[0--><div class="mb-4 flex items-center justify-between rounded-radius border border-success/40 bg-success/5 px-4 py-3"><div class="flex items-center gap-2">`);
							Tag($$renderer, { class: 'size-3.5 text-success' });
							$$renderer.push(`<!----> <span class="text-sm font-medium text-success">You saved <span class="font-bold">${$.escape(formatPrice($.store_get($$store_subs ??= {}, '$animatedSavings', animatedSavings), page?.data?.store?.currency?.code))}</span> on this order.</span></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div${$.attr_class(`h-fit divide-y divide-gray-200 overflow-hidden rounded-radius sm:border ${cartModule.partialCheckoutEnabled ? '[&>div:nth-child(2)]:max-sm:!border-t-0' : ''}`)}>`);

						if (cartModule.partialCheckoutEnabled) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><div class="flex h-full items-stretch gap-2"><div class="flex min-h-full items-center justify-center px-1">`);

							Checkbox($$renderer, {
								id: 'allItemsChecked',
								checked: cartModule.allItemsChecked,
								indeterminate: cartModule.isIndeterminate,
								onCheckedChange: cartModule.handleRootCheckedChange
							});

							$$renderer.push(`<!----></div> <label for="allItemsChecked" class="py-1.5 text-sm text-gray-700 hover:cursor-pointer">Select all items</label></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array = $.ensure_array_like(cartState.cart?.lineItems || []);

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let item = each_array[$$index_1];

							$$renderer.push(`<div class="group relative flex">`);

							if (cartModule.partialCheckoutEnabled) {
								$$renderer.push(`<!--[0--><label${$.attr('for', item.id)}${$.attr_class(`flex min-h-full items-center border-transparent px-4 hover:cursor-pointer ${item.isSelectedForCheckout ? 'bg-gray-100' : 'hover:bg-gray-50'}`)}>`);

								Checkbox($$renderer, {
									id: item.id,
									class: 'invisible absolute',
									onCheckedChange: (e) => cartModule.handleCheckedChange(e, item),
									get checked() {
										return item.isSelectedForCheckout;
									},

									set checked($$value) {
										item.isSelectedForCheckout = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> <div>`);

								if (item.isSelectedForCheckout) {
									$$renderer.push('<!--[0-->');
									Check($$renderer, { class: 'size-5', strokeWidth: 2.5 });
								} else {
									$$renderer.push('<!--[-1-->');
									Check($$renderer, { class: 'size-5 text-gray-300', strokeWidth: 2.5 });
								}

								$$renderer.push(`<!--]--></div></label>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <a class="flex flex-1 gap-3 py-5 sm:px-4 sm:p-3 md:gap-6 md:p-5"${$.attr('href', `/products/${item.slug}`)} target="_blank"><div class="flex flex-col items-center gap-3"><div class="relative flex items-center justify-center"><div class="overflow-hidden bg-gray-50 ring-gray-100">`);

							LazyImg($$renderer, {
								src: item.thumbnail || '/placeholder.svg',
								alt: item.title,
								class: 'w-24 object-top object-contain sm:w-32'
							});

							$$renderer.push(`<!----></div></div> <div class="sm:hidden">`);
							quantitySelector($$renderer, item);
							$$renderer.push(`<!----></div></div> <div class="flex flex-1 flex-col"><div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div class="flex-1"><h3 class="line-clamp-2 text-base font-bold tracking-tight text-gray-900 sm:text-lg">${$.escape(item.title)}</h3> <div class="mt-2 flex flex-wrap gap-2"><span class="inline-flex items-center rounded-radius border border-primary px-2 py-0.5 text-xs font-semibold ring-1 ring-gray-100">Qty: ${$.escape(item.qty)}</span> `);

							if (item.variant && item.variant.options && item.variant.options.length > 0) {
								$$renderer.push(`<!--[0--><!--[-->`);

								const each_array_1 = $.ensure_array_like(item.variant.options);

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let option = each_array_1[$$index];

									if (option?.option?.title && option?.value) {
										$$renderer.push(`<!--[0--><span class="inline-flex items-center rounded-radius border border-primary px-2 py-0.5 text-xs font-semibold ring-1 ring-primary/10">${$.escape(option.option?.title)}: ${$.escape(option?.value)}</span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div> <div class="flex justify-between"><div class="text-left lg:hidden"><div class="flex items-baseline gap-2"><p class="text-base font-bold text-gray-900 sm:text-lg">${$.escape(formatPrice(item.price * item.qty, page?.data?.store?.currency?.code))}</p> `);

							if (item.mrp > item.price) {
								$$renderer.push(`<!--[0--><span class="text-xs text-gray-400 line-through">${$.escape(formatPrice(item.mrp * item.qty, page?.data?.store?.currency?.code))}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> `);

							if (item.mrp > item.price) {
								$$renderer.push(`<!--[0--><p class="text-xs font-medium tracking-tight text-green-600">You saved ${$.escape(formatPrice(item.mrp * item.qty - item.price * item.qty, page?.data?.store?.currency?.code))}</p>`);
							} else {
								$$renderer.push(`<!--[-1--><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))} each</p>`);
							}

							$$renderer.push(`<!--]--></div> <div class="hidden lg:block">`);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400',
								'aria-label': 'Remove item',
								disabled: isUpdating(item),
								onclick: (e) => removeItem(e, item),
								children: ($$renderer) => {
									Trash($$renderer, { class: 'size-3.5 text-destructive' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div></div> <div class="mt-auto flex items-center justify-between pt-6"><div class="hidden items-center rounded-radius border border-border bg-background p-1 shadow-sm transition-all duration-300 hover:shadow-md sm:flex">`);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								onclick: (e) => cartModule.decreaseQty(e, item),
								disabled: isUpdating(item) || item.qty <= 1,
								class: 'flex h-7 w-7 items-center justify-center rounded-full',
								'aria-label': 'Decrease quantity',
								children: ($$renderer) => {
									Minus($$renderer, { class: 'size-3 text-gray-900' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <span class="flex min-w-[2.5rem] items-center justify-center px-1 text-xs font-bold text-gray-900">`);

							if (isUpdating(item)) {
								$$renderer.push('<!--[0-->');
								LoadingDots($$renderer, {});
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(item.qty)}`);
							}

							$$renderer.push(`<!--]--></span> `);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								class: 'flex h-7 w-7 items-center justify-center rounded-full',
								'aria-label': 'Increase quantity',
								disabled: isUpdating(item),
								onclick: (e) => cartModule.increaseQty(e, item),
								children: ($$renderer) => {
									Plus($$renderer, { class: 'size-3 text-gray-900' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div class="hidden sm:block lg:hidden">`);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400',
								'aria-label': 'Remove item',
								disabled: isUpdating(item),
								onclick: (e) => removeItem(e, item),
								children: ($$renderer) => {
									Trash($$renderer, { class: 'size-3.5 text-destructive' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div class="hidden text-right lg:block"><div class="flex items-baseline justify-end gap-2"><p class="text-base font-bold text-gray-900 sm:text-lg">${$.escape(formatPrice(item.price * item.qty, page?.data?.store?.currency?.code))}</p> `);

							if (item.mrp > item.price) {
								$$renderer.push(`<!--[0--><span class="text-xs line-through">${$.escape(formatPrice(item.mrp * item.qty, page?.data?.store?.currency?.code))}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> `);

							if (item.mrp > item.price) {
								$$renderer.push(`<!--[0--><p class="text-xs font-medium tracking-tight text-success">You saved ${$.escape(formatPrice(item.mrp * item.qty - item.price * item.qty, page?.data?.store?.currency?.code))}</p>`);
							} else {
								$$renderer.push(`<!--[-1--><p class="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))} each</p>`);
							}

							$$renderer.push(`<!--]--></div></div> `);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400 self-end mb-1.5',
								'aria-label': 'Remove item',
								disabled: isUpdating(item),
								onclick: (e) => removeItem(e, item),
								children: ($$renderer) => {
									Trash($$renderer, { class: 'size-3.5' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></a></div>`);
						}

						$$renderer.push(`<!--]--></div></div> <div class="flex flex-col gap-3">`);

						if (cartState.cart?.couponCode) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-between px-1 text-sm sm:text-base"><p class="font-medium">Coupon Applied</p> <div class="flex items-center gap-2 rounded-radius bg-gray-100 p-2 px-3"><p class="text-sm font-medium text-gray-600">${$.escape(cartState.cart?.couponCode)}</p> `);

							Button($$renderer, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1 text-destructive',
								onclick: () => cartState.removeCoupon(),
								children: ($$renderer) => {
									X($$renderer, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						CouponsDrawer($$renderer, {});
						$$renderer.push(`<!----> <div class="space-y-4 rounded-lg border border-border bg-background p-3 shadow-sm md:p-6"><div><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> `);

						if (cartModule.loadingForCart) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
							LoadingDots($$renderer, {});
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart?.subtotal, page?.data?.store?.currency?.code))}</span></div> `);

							if (cartState.cart?.discountAmount > 0) {
								$$renderer.push(`<!--[0--><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600">- ${$.escape(formatPrice(cartState.cart?.discountAmount, page?.data?.store?.currency?.code))}</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="flex flex-col gap-1"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> `);

							if (!cartState.cart?.shippingAddress) {
								$$renderer.push(`<!--[0--><span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
							} else if (cartState.cart?.shippingCharges) {
								$$renderer.push(`<!--[1--><span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart?.shippingCharges, page?.data?.store?.currency?.code))}</span>`);
							} else {
								$$renderer.push(`<!--[-1--><span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
							}

							$$renderer.push(`<!--]--></div></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900">${$.escape(formatPrice(cartState.cart?.total, page?.data?.store?.currency?.code))}</span></div> `);

							if (cartModule.showError) {
								$$renderer.push(`<!--[0--><div class="mt-4 rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100">${$.escape(cartModule.errorMessage)}</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3">`);
							LockKeyhole($$renderer, { class: 'h-3.5 w-3.5 text-gray-400' });
							$$renderer.push(`<!----> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> `);

							if (!cartModule.noItemsChecked) {
								$$renderer.push('<!--[0-->');

								CheckoutButton($$renderer, {
									onclick: cartModule.gotoCheckout,
									loading: cartModule.loadingForCheckout
								});
							} else {
								$$renderer.push(`<!--[-1--><div class="mt-4 rounded bg-yellow-50 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-yellow-700 ring-1 ring-yellow-100">Select items to proceed</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--></div></div> `);
						OrderTrustBadges($$renderer, {});
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}