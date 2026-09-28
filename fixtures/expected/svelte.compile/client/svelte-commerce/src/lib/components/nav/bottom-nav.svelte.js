import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary"></span>`);
var root_1 = $.from_html(`<a class="relative flex h-full flex-1 flex-col items-center justify-center transition-all duration-200"><div><!></div> <span> </span> <!></a>`);
var root_2 = $.from_html(`<span class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-primary text-[8px] font-bold text-black"> </span>`);
var root_3 = $.from_html(`<button class="flex h-full flex-1 flex-col items-center justify-center transition-all duration-200"><div class="relative flex h-7 w-7 items-center justify-center text-gray-600"><!> <!></div> <span class="truncate text-[9px] font-bold uppercase tracking-wider text-gray-600"> </span></button>`);
var root_4 = $.from_html(`<div class="rounded-lg border border-gray-100 p-2 transition-all duration-300 hover:bg-gray-50"><!></div>`);
var root_5 = $.from_html(`<div class="space-y-4"></div>`);
var root_6 = $.from_html(`<div class="flex h-full flex-col items-center justify-center"><p class="mb-4 text-gray-500">Your cart is empty</p> <!></div>`);
var root_7 = $.from_html(`<div class="border-t bg-white p-4"><div class="space-y-4"><div class="flex justify-between text-sm"><span>Subtotal</span> <span> </span></div> <div class="flex justify-between text-sm"><span>Shipping</span> <span>Calculated at checkout</span></div> <!> <div class="flex justify-between font-medium"><span>Total</span> <span> </span></div> <!></div></div>`);
var root_8 = $.from_html(`<div class="fixed inset-0 z-[1000001] bg-white"><div class="flex h-full flex-col"><header class="flex items-center gap-4 border-b p-4"><!> <h2 class="text-lg font-medium">Your Cart</h2></header> <div class="flex-1 overflow-auto p-4"><!></div> <!></div></div>`);
var root_9 = $.from_html(`<nav><div class="flex h-16 items-center justify-around px-3"></div></nav> <!> <div class="h-16 md:hidden"></div>`, 1);

export default function Bottom_nav($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const cartState = getCartState();
	let showCartModal = $.state(false);
	const modalHistoryKey = '__svelteCommerceBottomCart';
	let ownsHistoryEntry = false;

	function handleBrowserBack() {
		if (!$.get(showCartModal) || !ownsHistoryEntry) return;

		ownsHistoryEntry = false;
		$.set(showCartModal, false);
	}

	onMount(() => {
		window.addEventListener('popstate', handleBrowserBack);

		return () => window.removeEventListener('popstate', handleBrowserBack);
	});

	$.user_effect(() => {
		if (page.url.pathname) {
			$.set(showCartModal, false);
		}
	});

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		if ($.get(showCartModal) && !ownsHistoryEntry) {
			history.pushState({ ...history.state, [modalHistoryKey]: true }, '', window.location.href);
			ownsHistoryEntry = true;
		} else if (!$.get(showCartModal) && ownsHistoryEntry) {
			const isCurrentModalEntry = history.state?.[modalHistoryKey] === true;

			ownsHistoryEntry = false;

			if (isCurrentModalEntry) history.back();
		}
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
					$.set(showCartModal, true);
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

	var fragment = root_9();
	var nav = $.first_child(fragment);
	var div = $.child(nav);

	$.each(div, 21, () => $.get(navItems), $.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var a = root_1();
				var div_1 = $.child(a);
				var node_1 = $.child(div_1);

				$.component(node_1, () => $.get(item).icon, ($$anchor, item_icon) => {
					item_icon($$anchor, { size: 20, class: 'stroke-[1.6]' });
				});

				$.reset(div_1);

				var span = $.sibling(div_1, 2);
				var text = $.only_child(span, true);
				var node_2 = $.sibling(span, 2);

				{
					var consequent = ($$anchor) => {
						var span_1 = root();

						$.append($$anchor, span_1);
					};

					var d = $.derived(() => isActive($.get(item).href));

					$.if(node_2, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				$.reset(a);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a, 'href', $.get(item).href);
						$.set_class(div_1, 1, `relative flex h-7 w-7 items-center justify-center transition-colors duration-200 ${$0 ?? ''}`);
						$.set_class(span, 1, `truncate text-[9px] font-bold uppercase tracking-wider transition-colors duration-200 ${$1 ?? ''}`);
						$.set_text(text, $.get(item).label);
					},
					[
						() => isActive($.get(item).href) ? 'text-primary' : 'text-gray-600',
						() => isActive($.get(item).href) ? 'font-black text-black' : 'text-gray-600'
					]
				);

				$.append($$anchor, a);
			};

			var alternate = ($$anchor) => {
				var button = root_3();
				var div_2 = $.child(button);
				var node_3 = $.child(div_2);

				$.component(node_3, () => $.get(item).icon, ($$anchor, item_icon_1) => {
					item_icon_1($$anchor, { size: 20, class: 'stroke-[1.6]' });
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span_2 = root_2();
						var text_1 = $.only_child(span_2, true);

						$.template_effect(() => $.set_text(text_1, cartState?.cart?.qty));
						$.append($$anchor, span_2);
					};

					$.if(node_4, ($$render) => {
						if (cartState?.cart?.total && cartState.cart?.lineItems?.length > 0) $$render(consequent_2);
					});
				}

				$.reset(div_2);

				var span_3 = $.sibling(div_2, 2);
				var text_2 = $.only_child(span_3, true);

				$.reset(button);
				$.template_effect(() => $.set_text(text_2, $.get(item).label));

				$.delegated('click', button, function (...$$args) {
					$.get(item).onClick?.apply(this, $$args);
				});

				$.append($$anchor, button);
			};

			$.if(node, ($$render) => {
				if ($.get(item).href) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(div);
	$.reset(nav);

	var node_5 = $.sibling(nav, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_8();
			var div_4 = $.child(div_3);
			var header = $.child(div_4);
			var node_6 = $.child(header);

			Button(node_6, {
				variant: 'ghost',
				size: 'icon',
				class: 'rounded-full',
				onclick: () => $.set(showCartModal, false),
				children: ($$anchor, $$slotProps) => {
					ArrowLeft($$anchor, { size: 24 });
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(header);

			var div_5 = $.sibling(header, 2);
			var node_7 = $.child(div_5);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_5();

					$.each(div_6, 21, () => cartState.cart.lineItems || [], $.index, ($$anchor, _, i) => {
						var div_7 = root_4();
						var node_8 = $.child(div_7);

						CartItem(node_8, {
							removeItem: () => {},
							get cartProduct() {
								return cartState.cart.lineItems[i];
							},

							set cartProduct($$value) {
								cartState.cart.lineItems[i] = $$value;
							}
						});

						$.reset(div_7);
						$.append($$anchor, div_7);
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var alternate_1 = ($$anchor) => {
					var div_8 = root_6();
					var node_9 = $.sibling($.child(div_8), 2);

					Button(node_9, {
						onclick: () => {
							$.set(showCartModal, false);
							goto('/products');
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Continue Shopping');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_7, ($$render) => {
					if (cartState?.cart?.lineItems?.length) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_5);

			var node_10 = $.sibling(div_5, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_9 = root_7();
					var div_10 = $.child(div_9);
					var div_11 = $.child(div_10);
					var span_4 = $.sibling($.child(div_11), 2);
					var text_4 = $.only_child(span_4, true);

					$.reset(div_11);

					var node_11 = $.sibling(div_11, 4);

					Separator(node_11, {});

					var div_12 = $.sibling(node_11, 2);
					var span_5 = $.sibling($.child(div_12), 2);
					var text_5 = $.only_child(span_5, true);

					$.reset(div_12);

					var node_12 = $.sibling(div_12, 2);

					Button(node_12, {
						onclick: () => {
							$.set(showCartModal, false);
							goto('/checkout/cart');
						},
						size: 'lg',
						class: 'w-full rounded-pill bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors duration-300 hover:bg-emerald-900',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Proceed to Checkout');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_10);
					$.reset(div_9);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_4, $0);
							$.set_text(text_5, $1);
						},
						[
							() => formatPrice(cartState.cart.subtotal, cartState.cart.currencyCode),
							() => formatPrice(cartState.cart.total, cartState.cart.currencyCode)
						]
					);

					$.append($$anchor, div_9);
				};

				$.if(node_10, ($$render) => {
					if (cartState?.cart?.lineItems?.length) $$render(consequent_4);
				});
			}

			$.reset(div_4);
			$.reset(div_3);
			$.transition(3, div_3, () => slide, () => ({ duration: 300 }));
			$.append($$anchor, div_3);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showCartModal)) $$render(consequent_5);
		});
	}

	$.next(2);

	$.template_effect(($0) => $.set_class(nav, 1, $0), [
		() => $.clsx(cn('pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white font-sans md:hidden', className()))
	]);

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);