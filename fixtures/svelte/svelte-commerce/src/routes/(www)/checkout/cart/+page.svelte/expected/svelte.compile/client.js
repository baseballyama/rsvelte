import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center rounded-radius border border-border bg-background p-1 shadow-sm transition-all duration-300 hover:shadow-md"><!> <span class="flex min-w-[2.5rem] items-center justify-center px-1 text-xs font-bold text-gray-900"><!></span> <!></div>`);
var root_1 = $.from_html(`<div class="flex h-[60vh] flex-col items-center justify-center text-center"><div class="mb-6 rounded-full bg-gray-50 p-8 ring-1 ring-gray-100"><!></div> <h2 class="mb-2 text-xl font-bold uppercase tracking-widest text-gray-900">Your bag is empty</h2> <p class="mb-8 max-w-xs text-sm text-gray-500">Looks like you haven't added anything to your bag yet.</p> <!></div>`);
var root_2 = $.from_html(`<div class="mb-4 flex items-center justify-between rounded-radius border border-success/40 bg-success/5 px-4 py-3"><div class="flex items-center gap-2"><!> <span class="text-sm font-medium text-success">You saved <span class="font-bold"> </span> on this order.</span></div></div>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between"><div class="flex h-full items-stretch gap-2"><div class="flex min-h-full items-center justify-center px-1"><!></div> <label for="allItemsChecked" class="py-1.5 text-sm text-gray-700 hover:cursor-pointer">Select all items</label></div></div>`);
var root_4 = $.from_html(`<label><!> <div><!></div></label>`);
var root_5 = $.from_html(`<span class="inline-flex items-center rounded-radius border border-primary px-2 py-0.5 text-xs font-semibold ring-1 ring-primary/10"> </span>`);
var root_6 = $.from_html(`<span class="text-xs text-gray-400 line-through"> </span>`);
var root_7 = $.from_html(`<p class="text-xs font-medium tracking-tight text-green-600"> </p>`);
var root_8 = $.from_html(`<p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400"> </p>`);
var root_9 = $.from_html(`<span class="text-xs line-through"> </span>`);
var root_10 = $.from_html(`<p class="text-xs font-medium tracking-tight text-success"> </p>`);
var root_11 = $.from_html(`<p class="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground"> </p>`);
var root_12 = $.from_html(`<div class="group relative flex"><!> <a class="flex flex-1 gap-3 py-5 sm:px-4 sm:p-3 md:gap-6 md:p-5" target="_blank"><div class="flex flex-col items-center gap-3"><div class="relative flex items-center justify-center"><div class="overflow-hidden bg-gray-50 ring-gray-100"><!></div></div> <div class="sm:hidden"><!></div></div> <div class="flex flex-1 flex-col"><div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div class="flex-1"><h3 class="line-clamp-2 text-base font-bold tracking-tight text-gray-900 sm:text-lg"> </h3> <div class="mt-2 flex flex-wrap gap-2"><span class="inline-flex items-center rounded-radius border border-primary px-2 py-0.5 text-xs font-semibold ring-1 ring-gray-100"> </span> <!></div></div> <div class="flex justify-between"><div class="text-left lg:hidden"><div class="flex items-baseline gap-2"><p class="text-base font-bold text-gray-900 sm:text-lg"> </p> <!></div> <!></div> <div class="hidden lg:block"><!></div></div></div> <div class="mt-auto flex items-center justify-between pt-6"><div class="hidden items-center rounded-radius border border-border bg-background p-1 shadow-sm transition-all duration-300 hover:shadow-md sm:flex"><!> <span class="flex min-w-[2.5rem] items-center justify-center px-1 text-xs font-bold text-gray-900"><!></span> <!></div> <div class="hidden sm:block lg:hidden"><!></div> <div class="hidden text-right lg:block"><div class="flex items-baseline justify-end gap-2"><p class="text-base font-bold text-gray-900 sm:text-lg"> </p> <!></div> <!></div></div> <!></div></a></div>`);
var root_13 = $.from_html(`<div class="flex items-center justify-between px-1 text-sm sm:text-base"><p class="font-medium">Coupon Applied</p> <div class="flex items-center gap-2 rounded-radius bg-gray-100 p-2 px-3"><p class="text-sm font-medium text-gray-600"> </p> <!></div></div>`);
var root_14 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_15 = $.from_html(`<div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600"> </span></div>`);
var root_16 = $.from_html(`<span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
var root_17 = $.from_html(`<span class="font-bold text-gray-900"> </span>`);
var root_18 = $.from_html(`<span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
var root_19 = $.from_html(`<div class="mt-4 rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100"> </div>`);
var root_20 = $.from_html(`<div class="mt-4 rounded bg-yellow-50 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-yellow-700 ring-1 ring-yellow-100">Select items to proceed</div>`);
var root_21 = $.from_html(`<div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900"> </span></div> <!> <div class="flex flex-col gap-1"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> <!></div></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900"> </span></div> <!> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3"><!> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> <!></div>`);
var root_22 = $.from_html(`<div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div><!> <div><!> <!></div></div> <div class="flex flex-col gap-3"><!> <!> <div class="space-y-4 rounded-lg border border-border bg-background p-3 shadow-sm md:p-6"><div><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> <!></div></div> <!></div></div>`);
var root_23 = $.from_html(`<div class="flex h-96 flex-col items-center justify-center gap-3"><p class="text-xl text-gray-400">Your cart is empty</p> <!></div>`);
var root_24 = $.from_html(`<div class="flex min-h-96 items-center justify-center py-8"><!></div>`);
var root_25 = $.from_html(`<div class="min-h-screen py-8"><div class="container mx-auto px-4"><!>  <!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $animatedSavings = () => $.store_get(animatedSavings, '$animatedSavings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const // Keyed by line id, matching the store: cart.svelte.js resolves `lineId = cart_item?.id` and
	// flips `updatingItem[lineId]` around each mutation. Wrapped in a typed accessor because the
	// connector's CartLineItem type resolves without its own fields in this file — the same drift
	// that makes `item.qty`, `item.price` and `item.mrp` error throughout.
	// `any` on purpose: the connector's CartLineItem type resolves without its own fields in this
	// file, so a structural type here is rejected as having "no properties in common" with it.
	// Removing a line is one tap with no dialog, so offer an undo instead of a blocking confirm.
	quantitySelector = ($$anchor, item = $.noop) => {
		var div = root();
		var node = $.child(div);

		{
			let $0 = $.derived(() => isUpdating(item()) || item().qty <= 1);

			Button(node, {
				variant: 'ghost',
				size: 'icon',
				onclick: (e) => cartModule.decreaseQty(e, item()),
				get disabled() {
					return $.get($0);
				},
				class: 'flex h-7 w-7 items-center justify-center',
				'aria-label': 'Decrease quantity',
				children: ($$anchor, $$slotProps) => {
					Minus($$anchor, { class: 'size-3 text-gray-900' });
				},
				$$slots: { default: true }
			});
		}

		var span = $.sibling(node, 2);
		var node_1 = $.child(span);

		{
			var consequent = ($$anchor) => {
				LoadingDots($$anchor, {});
			};

			var d = $.derived(() => isUpdating(item()));

			var alternate = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, item().qty));
				$.append($$anchor, text);
			};

			$.if(node_1, ($$render) => {
				if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(span);

		var node_2 = $.sibling(span, 2);

		{
			let $0 = $.derived(() => isUpdating(item()));

			Button(node_2, {
				variant: 'ghost',
				size: 'icon',
				class: 'flex h-7 w-7 items-center justify-center',
				'aria-label': 'Increase quantity',
				get disabled() {
					return $.get($0);
				},
				onclick: (e) => cartModule.increaseQty(e, item()),
				children: ($$anchor, $$slotProps) => {
					Plus($$anchor, { class: 'size-3 text-gray-900' });
				},
				$$slots: { default: true }
			});
		}

		$.reset(div);
		$.append($$anchor, div);
	};

	const cartModule = new CartModule();
	const cartState = cartModule.cartState;
	const isUpdating = (item) => !!cartState.updatingItem[item?.id];

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

	$.user_effect(() => {
		animatedSavings.set($.get(totalSavings));
	});

	var div_1 = root_25();

	$.head('192krp', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Cart - ${(page?.data?.store?.name || '') ?? ''}`;
		});
	});

	var div_2 = $.child(div_1);
	var node_3 = $.child(div_2);

	CheckoutHeader(node_3, { step: 1 });

	var node_4 = $.sibling(node_3, 2);

	$.await(
		node_4,
		() => cartState.hasLoaded,
		($$anchor) => {
			var div_49 = root_24();
			var node_43 = $.child(div_49);

			LoaderCircle(node_43, { class: 'animate-spin' });
			$.reset(div_49);
			$.append($$anchor, div_49);
		},
		($$anchor, _) => {
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			{
				var consequent_1 = ($$anchor) => {
					var div_3 = root_1();
					var div_4 = $.child(div_3);
					var node_6 = $.child(div_4);

					ShoppingBag(node_6, { class: 'h-12 w-12 text-gray-300' });
					$.reset(div_4);

					var node_7 = $.sibling(div_4, 6);

					Button(node_7, {
						href: '/',
						variant: 'default',
						class: 'rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.2em]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Start Shopping');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				var alternate_8 = ($$anchor) => {
					var div_5 = root_22();
					var div_6 = $.child(div_5);
					var node_8 = $.child(div_6);

					{
						var consequent_2 = ($$anchor) => {
							var div_7 = root_2();
							var div_8 = $.child(div_7);
							var node_9 = $.child(div_8);

							Tag(node_9, { class: 'size-3.5 text-success' });

							var span_1 = $.sibling(node_9, 2);
							var span_2 = $.sibling($.child(span_1));
							var text_2 = $.only_child(span_2, true);

							$.next();
							$.reset(span_1);
							$.reset(div_8);
							$.reset(div_7);

							$.template_effect(($0) => $.set_text(text_2, $0), [
								() => formatPrice($animatedSavings(), page?.data?.store?.currency?.code)
							]);

							$.append($$anchor, div_7);
						};

						$.if(node_8, ($$render) => {
							if ($.get(totalSavings) > 0) $$render(consequent_2);
						});
					}

					var div_9 = $.sibling(node_8, 2);
					var node_10 = $.child(div_9);

					{
						var consequent_3 = ($$anchor) => {
							var div_10 = root_3();
							var div_11 = $.child(div_10);
							var div_12 = $.child(div_11);
							var node_11 = $.child(div_12);

							Checkbox(node_11, {
								id: 'allItemsChecked',
								get checked() {
									return cartModule.allItemsChecked;
								},

								get indeterminate() {
									return cartModule.isIndeterminate;
								},

								get onCheckedChange() {
									return cartModule.handleRootCheckedChange;
								}
							});

							$.reset(div_12);
							$.next(2);
							$.reset(div_11);
							$.reset(div_10);
							$.append($$anchor, div_10);
						};

						$.if(node_10, ($$render) => {
							if (cartModule.partialCheckoutEnabled) $$render(consequent_3);
						});
					}

					var node_12 = $.sibling(node_10, 2);

					$.each(node_12, 17, () => cartState.cart?.lineItems || [], $.index, ($$anchor, item, $$index_1) => {
						var div_13 = root_12();
						var node_13 = $.child(div_13);

						{
							var consequent_5 = ($$anchor) => {
								var label = root_4();
								var node_14 = $.child(label);

								Checkbox(node_14, {
									get id() {
										return $.get(item).id;
									},
									class: 'invisible absolute',
									onCheckedChange: (e) => cartModule.handleCheckedChange(e, $.get(item)),
									get checked() {
										return $.get(item).isSelectedForCheckout;
									},

									set checked($$value) {
										($.get(item).isSelectedForCheckout = $$value);
									}
								});

								var div_14 = $.sibling(node_14, 2);
								var node_15 = $.child(div_14);

								{
									var consequent_4 = ($$anchor) => {
										Check($$anchor, { class: 'size-5', strokeWidth: 2.5 });
									};

									var alternate_1 = ($$anchor) => {
										Check($$anchor, { class: 'size-5 text-gray-300', strokeWidth: 2.5 });
									};

									$.if(node_15, ($$render) => {
										if ($.get(item).isSelectedForCheckout) $$render(consequent_4); else $$render(alternate_1, -1);
									});
								}

								$.reset(div_14);
								$.reset(label);

								$.template_effect(() => {
									$.set_attribute(label, 'for', $.get(item).id);
									$.set_class(label, 1, `flex min-h-full items-center border-transparent px-4 hover:cursor-pointer ${$.get(item).isSelectedForCheckout ? 'bg-gray-100' : 'hover:bg-gray-50'}`);
								});

								$.append($$anchor, label);
							};

							$.if(node_13, ($$render) => {
								if (cartModule.partialCheckoutEnabled) $$render(consequent_5);
							});
						}

						var a = $.sibling(node_13, 2);
						var div_15 = $.child(a);
						var div_16 = $.child(div_15);
						var div_17 = $.child(div_16);
						var node_16 = $.child(div_17);

						{
							let $0 = $.derived(() => $.get(item).thumbnail || '/placeholder.svg');

							LazyImg(node_16, {
								get src() {
									return $.get($0);
								},

								get alt() {
									return $.get(item).title;
								},
								class: 'w-24 object-top object-contain sm:w-32'
							});
						}

						$.reset(div_17);
						$.reset(div_16);

						var div_18 = $.sibling(div_16, 2);
						var node_17 = $.child(div_18);

						quantitySelector(node_17, () => $.get(item));
						$.reset(div_18);
						$.reset(div_15);

						var div_19 = $.sibling(div_15, 2);
						var div_20 = $.child(div_19);
						var div_21 = $.child(div_20);
						var h3 = $.child(div_21);
						var text_3 = $.only_child(h3, true);
						var div_22 = $.sibling(h3, 2);
						var span_3 = $.child(div_22);
						var text_4 = $.only_child(span_3);
						var node_18 = $.sibling(span_3, 2);

						{
							var consequent_7 = ($$anchor) => {
								var fragment_7 = $.comment();
								var node_19 = $.first_child(fragment_7);

								$.each(node_19, 17, () => $.get(item).variant.options, $.index, ($$anchor, option) => {
									var fragment_8 = $.comment();
									var node_20 = $.first_child(fragment_8);

									{
										var consequent_6 = ($$anchor) => {
											var span_4 = root_5();
											var text_5 = $.only_child(span_4);

											$.template_effect(() => $.set_text(text_5, `${$.get(option).option?.title ?? ''}: ${$.get(option)?.value ?? ''}`));
											$.append($$anchor, span_4);
										};

										$.if(node_20, ($$render) => {
											if ($.get(option)?.option?.title && $.get(option)?.value) $$render(consequent_6);
										});
									}

									$.append($$anchor, fragment_8);
								});

								$.append($$anchor, fragment_7);
							};

							$.if(node_18, ($$render) => {
								if ($.get(item).variant && $.get(item).variant.options && $.get(item).variant.options.length > 0) $$render(consequent_7);
							});
						}

						$.reset(div_22);
						$.reset(div_21);

						var div_23 = $.sibling(div_21, 2);
						var div_24 = $.child(div_23);
						var div_25 = $.child(div_24);
						var p = $.child(div_25);
						var text_6 = $.only_child(p, true);
						var node_21 = $.sibling(p, 2);

						{
							var consequent_8 = ($$anchor) => {
								var span_5 = root_6();
								var text_7 = $.only_child(span_5, true);

								$.template_effect(($0) => $.set_text(text_7, $0), [
									() => formatPrice($.get(item).mrp * $.get(item).qty, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, span_5);
							};

							$.if(node_21, ($$render) => {
								if ($.get(item).mrp > $.get(item).price) $$render(consequent_8);
							});
						}

						$.reset(div_25);

						var node_22 = $.sibling(div_25, 2);

						{
							var consequent_9 = ($$anchor) => {
								var p_1 = root_7();
								var text_8 = $.only_child(p_1);

								$.template_effect(($0) => $.set_text(text_8, `You saved ${$0 ?? ''}`), [
									() => formatPrice($.get(item).mrp * $.get(item).qty - $.get(item).price * $.get(item).qty, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, p_1);
							};

							var alternate_2 = ($$anchor) => {
								var p_2 = root_8();
								var text_9 = $.only_child(p_2);

								$.template_effect(($0) => $.set_text(text_9, `${$0 ?? ''} each`), [
									() => formatPrice($.get(item).price, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, p_2);
							};

							$.if(node_22, ($$render) => {
								if ($.get(item).mrp > $.get(item).price) $$render(consequent_9); else $$render(alternate_2, -1);
							});
						}

						$.reset(div_24);

						var div_26 = $.sibling(div_24, 2);
						var node_23 = $.child(div_26);

						{
							let $0 = $.derived(() => isUpdating($.get(item)));

							Button(node_23, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400',
								'aria-label': 'Remove item',
								get disabled() {
									return $.get($0);
								},
								onclick: (e) => removeItem(e, $.get(item)),
								children: ($$anchor, $$slotProps) => {
									Trash($$anchor, { class: 'size-3.5 text-destructive' });
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_26);
						$.reset(div_23);
						$.reset(div_20);

						var div_27 = $.sibling(div_20, 2);
						var div_28 = $.child(div_27);
						var node_24 = $.child(div_28);

						{
							let $0 = $.derived(() => isUpdating($.get(item)) || $.get(item).qty <= 1);

							Button(node_24, {
								variant: 'ghost',
								size: 'icon',
								onclick: (e) => cartModule.decreaseQty(e, $.get(item)),
								get disabled() {
									return $.get($0);
								},
								class: 'flex h-7 w-7 items-center justify-center rounded-full',
								'aria-label': 'Decrease quantity',
								children: ($$anchor, $$slotProps) => {
									Minus($$anchor, { class: 'size-3 text-gray-900' });
								},
								$$slots: { default: true }
							});
						}

						var span_6 = $.sibling(node_24, 2);
						var node_25 = $.child(span_6);

						{
							var consequent_10 = ($$anchor) => {
								LoadingDots($$anchor, {});
							};

							var d_1 = $.derived(() => isUpdating($.get(item)));

							var alternate_3 = ($$anchor) => {
								var text_10 = $.text();

								$.template_effect(() => $.set_text(text_10, $.get(item).qty));
								$.append($$anchor, text_10);
							};

							$.if(node_25, ($$render) => {
								if ($.get(d_1)) $$render(consequent_10); else $$render(alternate_3, -1);
							});
						}

						$.reset(span_6);

						var node_26 = $.sibling(span_6, 2);

						{
							let $0 = $.derived(() => isUpdating($.get(item)));

							Button(node_26, {
								variant: 'ghost',
								size: 'icon',
								class: 'flex h-7 w-7 items-center justify-center rounded-full',
								'aria-label': 'Increase quantity',
								get disabled() {
									return $.get($0);
								},
								onclick: (e) => cartModule.increaseQty(e, $.get(item)),
								children: ($$anchor, $$slotProps) => {
									Plus($$anchor, { class: 'size-3 text-gray-900' });
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_28);

						var div_29 = $.sibling(div_28, 2);
						var node_27 = $.child(div_29);

						{
							let $0 = $.derived(() => isUpdating($.get(item)));

							Button(node_27, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400',
								'aria-label': 'Remove item',
								get disabled() {
									return $.get($0);
								},
								onclick: (e) => removeItem(e, $.get(item)),
								children: ($$anchor, $$slotProps) => {
									Trash($$anchor, { class: 'size-3.5 text-destructive' });
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_29);

						var div_30 = $.sibling(div_29, 2);
						var div_31 = $.child(div_30);
						var p_3 = $.child(div_31);
						var text_11 = $.only_child(p_3, true);
						var node_28 = $.sibling(p_3, 2);

						{
							var consequent_11 = ($$anchor) => {
								var span_7 = root_9();
								var text_12 = $.only_child(span_7, true);

								$.template_effect(($0) => $.set_text(text_12, $0), [
									() => formatPrice($.get(item).mrp * $.get(item).qty, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, span_7);
							};

							$.if(node_28, ($$render) => {
								if ($.get(item).mrp > $.get(item).price) $$render(consequent_11);
							});
						}

						$.reset(div_31);

						var node_29 = $.sibling(div_31, 2);

						{
							var consequent_12 = ($$anchor) => {
								var p_4 = root_10();
								var text_13 = $.only_child(p_4);

								$.template_effect(($0) => $.set_text(text_13, `You saved ${$0 ?? ''}`), [
									() => formatPrice($.get(item).mrp * $.get(item).qty - $.get(item).price * $.get(item).qty, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, p_4);
							};

							var alternate_4 = ($$anchor) => {
								var p_5 = root_11();
								var text_14 = $.only_child(p_5);

								$.template_effect(($0) => $.set_text(text_14, `${$0 ?? ''} each`), [
									() => formatPrice($.get(item).price, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, p_5);
							};

							$.if(node_29, ($$render) => {
								if ($.get(item).mrp > $.get(item).price) $$render(consequent_12); else $$render(alternate_4, -1);
							});
						}

						$.reset(div_30);
						$.reset(div_27);

						var node_30 = $.sibling(div_27, 2);

						{
							let $0 = $.derived(() => isUpdating($.get(item)));

							Button(node_30, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1.5 text-gray-400 self-end mb-1.5',
								'aria-label': 'Remove item',
								get disabled() {
									return $.get($0);
								},
								onclick: (e) => removeItem(e, $.get(item)),
								children: ($$anchor, $$slotProps) => {
									Trash($$anchor, { class: 'size-3.5' });
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_19);
						$.reset(a);
						$.reset(div_13);

						$.template_effect(
							($0, $1) => {
								$.set_attribute(a, 'href', `/products/${$.get(item).slug}`);
								$.set_text(text_3, $.get(item).title);
								$.set_text(text_4, `Qty: ${$.get(item).qty ?? ''}`);
								$.set_text(text_6, $0);
								$.set_text(text_11, $1);
							},
							[
								() => formatPrice($.get(item).price * $.get(item).qty, page?.data?.store?.currency?.code),
								() => formatPrice($.get(item).price * $.get(item).qty, page?.data?.store?.currency?.code)
							]
						);

						$.append($$anchor, div_13);
					});

					$.reset(div_9);
					$.reset(div_6);

					var div_32 = $.sibling(div_6, 2);
					var node_31 = $.child(div_32);

					{
						var consequent_13 = ($$anchor) => {
							var div_33 = root_13();
							var div_34 = $.sibling($.child(div_33), 2);
							var p_6 = $.child(div_34);
							var text_15 = $.only_child(p_6, true);
							var node_32 = $.sibling(p_6, 2);

							Button(node_32, {
								variant: 'ghost',
								size: 'icon',
								class: 'h-auto w-auto p-1 text-destructive',
								onclick: () => cartState.removeCoupon(),
								children: ($$anchor, $$slotProps) => {
									X($$anchor, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$.reset(div_34);
							$.reset(div_33);
							$.template_effect(() => $.set_text(text_15, cartState.cart?.couponCode));
							$.append($$anchor, div_33);
						};

						$.if(node_31, ($$render) => {
							if (cartState.cart?.couponCode) $$render(consequent_13);
						});
					}

					var node_33 = $.sibling(node_31, 2);

					CouponsDrawer(node_33, {});

					var div_35 = $.sibling(node_33, 2);
					var div_36 = $.child(div_35);
					var node_34 = $.sibling($.child(div_36), 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_37 = root_14();
							var node_35 = $.child(div_37);

							LoadingDots(node_35, {});
							$.reset(div_37);
							$.append($$anchor, div_37);
						};

						var alternate_7 = ($$anchor) => {
							var div_38 = root_21();
							var div_39 = $.child(div_38);
							var div_40 = $.child(div_39);
							var span_8 = $.sibling($.child(div_40), 2);
							var text_16 = $.only_child(span_8, true);

							$.reset(div_40);

							var node_36 = $.sibling(div_40, 2);

							{
								var consequent_15 = ($$anchor) => {
									var div_41 = root_15();
									var span_9 = $.sibling($.child(div_41), 2);
									var text_17 = $.only_child(span_9);

									$.reset(div_41);

									$.template_effect(($0) => $.set_text(text_17, `- ${$0 ?? ''}`), [
										() => formatPrice(cartState.cart?.discountAmount, page?.data?.store?.currency?.code)
									]);

									$.append($$anchor, div_41);
								};

								$.if(node_36, ($$render) => {
									if (cartState.cart?.discountAmount > 0) $$render(consequent_15);
								});
							}

							var div_42 = $.sibling(node_36, 2);
							var div_43 = $.child(div_42);
							var node_37 = $.sibling($.child(div_43), 2);

							{
								var consequent_16 = ($$anchor) => {
									var span_10 = root_16();

									$.append($$anchor, span_10);
								};

								var consequent_17 = ($$anchor) => {
									var span_11 = root_17();
									var text_18 = $.only_child(span_11, true);

									$.template_effect(($0) => $.set_text(text_18, $0), [
										() => formatPrice(cartState.cart?.shippingCharges, page?.data?.store?.currency?.code)
									]);

									$.append($$anchor, span_11);
								};

								var alternate_5 = ($$anchor) => {
									var span_12 = root_18();

									$.append($$anchor, span_12);
								};

								$.if(node_37, ($$render) => {
									if (!cartState.cart?.shippingAddress) $$render(consequent_16); else if (cartState.cart?.shippingCharges) $$render(consequent_17, 1); else $$render(alternate_5, -1);
								});
							}

							$.reset(div_43);
							$.reset(div_42);
							$.reset(div_39);

							var div_44 = $.sibling(div_39, 2);
							var span_13 = $.sibling($.child(div_44), 2);
							var text_19 = $.only_child(span_13, true);

							$.reset(div_44);

							var node_38 = $.sibling(div_44, 2);

							{
								var consequent_18 = ($$anchor) => {
									var div_45 = root_19();
									var text_20 = $.only_child(div_45, true);

									$.template_effect(() => $.set_text(text_20, cartModule.errorMessage));
									$.append($$anchor, div_45);
								};

								$.if(node_38, ($$render) => {
									if (cartModule.showError) $$render(consequent_18);
								});
							}

							var div_46 = $.sibling(node_38, 2);
							var node_39 = $.child(div_46);

							LockKeyhole(node_39, { class: 'h-3.5 w-3.5 text-gray-400' });
							$.next(2);
							$.reset(div_46);

							var node_40 = $.sibling(div_46, 2);

							{
								var consequent_19 = ($$anchor) => {
									CheckoutButton($$anchor, {
										get onclick() {
											return cartModule.gotoCheckout;
										},

										get loading() {
											return cartModule.loadingForCheckout;
										}
									});
								};

								var alternate_6 = ($$anchor) => {
									var div_47 = root_20();

									$.append($$anchor, div_47);
								};

								$.if(node_40, ($$render) => {
									if (!cartModule.noItemsChecked) $$render(consequent_19); else $$render(alternate_6, -1);
								});
							}

							$.reset(div_38);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_16, $0);
									$.set_text(text_19, $1);
								},
								[
									() => formatPrice(cartState.cart?.subtotal, page?.data?.store?.currency?.code),
									() => formatPrice(cartState.cart?.total, page?.data?.store?.currency?.code)
								]
							);

							$.append($$anchor, div_38);
						};

						$.if(node_34, ($$render) => {
							if (cartModule.loadingForCart) $$render(consequent_14); else $$render(alternate_7, -1);
						});
					}

					$.reset(div_36);
					$.reset(div_35);

					var node_41 = $.sibling(div_35, 2);

					OrderTrustBadges(node_41, {});
					$.reset(div_32);
					$.reset(div_5);
					$.template_effect(() => $.set_class(div_9, 1, `h-fit divide-y divide-gray-200 overflow-hidden rounded-radius sm:border ${cartModule.partialCheckoutEnabled ? '[&>div:nth-child(2)]:max-sm:!border-t-0' : ''}`));
					$.append($$anchor, div_5);
				};

				$.if(node_5, ($$render) => {
					if (!cartState.cart?.lineItems?.length) $$render(consequent_1); else $$render(alternate_8, -1);
				});
			}

			$.append($$anchor, fragment_4);
		},
		($$anchor) => {
			var div_48 = root_23();
			var node_42 = $.sibling($.child(div_48), 2);

			Button(node_42, {
				class: 'ml-4',
				href: '/',
				variant: 'outline',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Continue Shopping');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			$.reset(div_48);
			$.append($$anchor, div_48);
		}
	);

	$.reset(div_2);
	$.reset(div_1);
	$.append($$anchor, div_1);
	$.pop();
	$$cleanup();
}