import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';

import {
	ChevronLeft,
	CreditCard,
	LockKeyhole,
	Mail,
	MapPin,
	Pencil,
	Truck
} from '@lucide/svelte';

import { formatPrice } from '$lib/core/utils';
import { page } from '$app/state';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';
import { appendOneTimeCartId } from '$lib/core/utils/index.js';

var root = $.from_html(`<meta name="robots" content="noindex, nofollow"/>`);
var root_1 = $.from_html(`<!> Back to Payment`, 1);
var root_2 = $.from_html(`<!> Edit`, 1);
var root_3 = $.from_html(`<div class="flex gap-3 py-3 text-sm"><div class="relative size-16 shrink-0 overflow-hidden rounded bg-gray-50 p-1"><img class="size-full object-contain"/></div> <div class="flex min-w-0 flex-1 flex-col justify-between py-1"><div><p class="line-clamp-2 font-medium text-gray-900"> </p> <p class="text-xs text-gray-500"> </p></div> <p class="font-bold text-gray-900"> </p></div></div>`);
var root_4 = $.from_html(`<p> </p>`);
var root_5 = $.from_html(`<div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);"><!> Contact</h2> <!></div> <div class="space-y-1 pt-3 text-sm text-gray-600"><!> <!></div></div>`);
var root_6 = $.from_html(`<p class="mt-1"> </p>`);
var root_7 = $.from_html(`<div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);"><!> Delivery Address</h2> <!></div> <div class="pt-3 text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900"> </p> <p> </p> <!> <p> </p> <!></div></div>`);
var root_8 = $.from_html(`<p class="text-xs"> </p>`);
var root_9 = $.from_html(`<div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);"><!> Shipping Method</h2> <!></div> <div class="flex items-center justify-between pt-3 text-sm text-gray-600"><div><p class="font-bold text-gray-900"> <!></p> <!></div> <span class="font-bold"> </span></div></div>`);
var root_10 = $.from_html(`<div class="flex h-10 w-12 items-center justify-center rounded border border-border bg-white p-1 shadow-sm"><img class="h-full w-full object-contain"/></div>`);
var root_11 = $.from_html(`<div class="flex justify-between text-sm"><span class="font-medium text-gray-500"> </span> <span class="font-bold uppercase tracking-tight text-orange-600"> </span></div>`);
var root_12 = $.from_html(`<span class="font-bold text-gray-900"> </span>`);
var root_13 = $.from_html(`<span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
var root_14 = $.from_html(`<div class="rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100"> </div>`);
var root_15 = $.from_html(`<div class="min-h-screen py-8"><div class="container mx-auto px-4"><!> <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"><h1 class="text-xl font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Review Your Order</h1> <!></div> <div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="flex flex-col gap-4"><div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);"> </h2> <!></div> <div class="divide-y divide-gray-100"></div></div> <!> <!> <!> <div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);"><!> Payment Method</h2> <!></div> <div class="flex items-center gap-3 pt-3"><!> <span class="text-sm font-bold uppercase tracking-tight text-gray-900"> </span></div></div></div> <div class="flex h-fit flex-col gap-3"><div class="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> <div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900"> </span></div> <!> <div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> <!></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900"> </span></div> <!> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3"><!> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> <!></div></div> <!></div></div></div></div>`);

export default function Review($$anchor, $$props) {
	$.push($$props, true);

	const cartState = $$props.paymentModule.cartState;
	const selectedItems = $.derived(() => cartState.cart?.lineItems?.filter((i) => i.isSelectedForCheckout) || []);
	const selectedPaymentMethod = $.derived(() => $$props.paymentModule.listOfPaymentMethods?.find((m) => m.code === $$props.paymentModule.SELECTED_PG_CODE));
	const selectedShippingRate = $.derived(() => $$props.paymentModule.shippingRates?.data?.find((r) => r.id === cartState.cart?.shippingRateId));
	const currencyCode = $.derived(() => page?.data?.store?.currency?.code);
	var div = root_15();

	$.head('1qy067h', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Checkout - Review Order';
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	CheckoutHeader(node, { step: 3 });

	var div_2 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Button(node_1, {
		variant: 'outline',
		get onclick() {
			return $$props.onback;
		},
		class: 'group flex w-fit items-center gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			ChevronLeft(node_2, {
				class: 'size-4 transition-transform duration-300 group-hover:-translate-x-1'
			});

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var h2 = $.child(div_6);
	var text = $.only_child(h2);
	var node_3 = $.sibling(h2, 2);

	{
		let $0 = $.derived(() => appendOneTimeCartId('/checkout/cart'));

		Button(node_3, {
			variant: 'ghost',
			size: 'sm',
			get href() {
				return $.get($0);
			},
			class: 'h-8 text-primary hover:text-primary/80',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_4 = $.first_child(fragment_1);

				Pencil(node_4, { class: 'mr-1 size-3.5' });
				$.next();
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);

	$.each(div_7, 21, () => $.get(selectedItems), $.index, ($$anchor, item) => {
		var div_8 = root_3();
		var div_9 = $.child(div_8);
		var img = $.only_child(div_9);
		var div_10 = $.sibling(div_9, 2);
		var div_11 = $.child(div_10);
		var p = $.child(div_11);
		var text_1 = $.only_child(p, true);
		var p_1 = $.sibling(p, 2);
		var text_2 = $.only_child(p_1);

		$.reset(div_11);

		var p_2 = $.sibling(div_11, 2);
		var text_3 = $.only_child(p_2, true);

		$.reset(div_10);
		$.reset(div_8);

		$.template_effect(
			($0) => {
				$.set_attribute(img, 'src', $.get(item)?.thumbnail || '/placeholder.svg');
				$.set_attribute(img, 'alt', $.get(item).title);
				$.set_text(text_1, $.get(item).title);
				$.set_text(text_2, `Qty: ${$.get(item).qty ?? ''}`);
				$.set_text(text_3, $0);
			},
			[
				() => formatPrice($.get(item).price * $.get(item).qty, $.get(currencyCode))
			]
		);

		$.append($$anchor, div_8);
	});

	$.reset(div_7);
	$.reset(div_5);

	var node_5 = $.sibling(div_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_12 = root_5();
			var div_13 = $.child(div_12);
			var h2_1 = $.child(div_13);
			var node_6 = $.child(h2_1);

			Mail(node_6, { class: 'size-4 text-primary' });
			$.next();
			$.reset(h2_1);

			var node_7 = $.sibling(h2_1, 2);

			{
				let $0 = $.derived(() => appendOneTimeCartId('/checkout/address'));

				Button(node_7, {
					variant: 'ghost',
					size: 'sm',
					get href() {
						return $.get($0);
					},
					class: 'h-8 text-primary hover:text-primary/80',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_8 = $.first_child(fragment_2);

						Pencil(node_8, { class: 'mr-1 size-3.5' });
						$.next();
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var node_9 = $.child(div_14);

			{
				var consequent = ($$anchor) => {
					var p_3 = root_4();
					var text_4 = $.only_child(p_3);

					$.template_effect(() => $.set_text(text_4, `Email: ${cartState.cart.email ?? ''}`));
					$.append($$anchor, p_3);
				};

				$.if(node_9, ($$render) => {
					if (cartState.cart.email) $$render(consequent);
				});
			}

			var node_10 = $.sibling(node_9, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_4 = root_4();
					var text_5 = $.only_child(p_4);

					$.template_effect(() => $.set_text(text_5, `Phone: ${cartState.cart.phone ?? ''}`));
					$.append($$anchor, p_4);
				};

				$.if(node_10, ($$render) => {
					if (cartState.cart.phone) $$render(consequent_1);
				});
			}

			$.reset(div_14);
			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_5, ($$render) => {
			if (cartState.cart?.email || cartState.cart?.phone) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_5, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_15 = root_7();
			var div_16 = $.child(div_15);
			var h2_2 = $.child(div_16);
			var node_12 = $.child(h2_2);

			MapPin(node_12, { class: 'size-4 text-primary' });
			$.next();
			$.reset(h2_2);

			var node_13 = $.sibling(h2_2, 2);

			{
				let $0 = $.derived(() => appendOneTimeCartId('/checkout/address'));

				Button(node_13, {
					variant: 'ghost',
					size: 'sm',
					get href() {
						return $.get($0);
					},
					class: 'h-8 text-primary hover:text-primary/80',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_14 = $.first_child(fragment_3);

						Pencil(node_14, { class: 'mr-1 size-3.5' });
						$.next();
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var p_5 = $.child(div_17);
			var text_6 = $.only_child(p_5);
			var p_6 = $.sibling(p_5, 2);
			var text_7 = $.only_child(p_6, true);
			var node_15 = $.sibling(p_6, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p_7 = root_4();
					var text_8 = $.only_child(p_7, true);

					$.template_effect(() => $.set_text(text_8, cartState.cart.shippingAddress?.address_2));
					$.append($$anchor, p_7);
				};

				$.if(node_15, ($$render) => {
					if (cartState.cart.shippingAddress?.address_2) $$render(consequent_3);
				});
			}

			var p_8 = $.sibling(node_15, 2);
			var text_9 = $.only_child(p_8);
			var node_16 = $.sibling(p_8, 2);

			{
				var consequent_4 = ($$anchor) => {
					var p_9 = root_6();
					var text_10 = $.only_child(p_9, true);

					$.template_effect(() => $.set_text(text_10, cartState.cart.shippingAddress?.phone));
					$.append($$anchor, p_9);
				};

				$.if(node_16, ($$render) => {
					if (cartState.cart.shippingAddress?.phone) $$render(consequent_4);
				});
			}

			$.reset(div_17);
			$.reset(div_15);

			$.template_effect(() => {
				$.set_text(text_6, `${cartState.cart.shippingAddress?.firstName ?? ''}
								${cartState.cart.shippingAddress?.lastName ?? ''}`);

				$.set_text(text_7, cartState.cart.shippingAddress?.address_1);

				$.set_text(text_9, `${cartState.cart.shippingAddress?.city ?? ''}, ${cartState.cart.shippingAddress?.state ?? ''}, ${cartState.cart.shippingAddress?.countryCode ?? ''}
								${cartState.cart.shippingAddress?.zip ?? ''}`);
			});

			$.append($$anchor, div_15);
		};

		$.if(node_11, ($$render) => {
			if (cartState.cart?.shippingAddress) $$render(consequent_5);
		});
	}

	var node_17 = $.sibling(node_11, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_18 = root_9();
			var div_19 = $.child(div_18);
			var h2_3 = $.child(div_19);
			var node_18 = $.child(h2_3);

			Truck(node_18, { class: 'size-4 text-primary' });
			$.next();
			$.reset(h2_3);

			var node_19 = $.sibling(h2_3, 2);

			Button(node_19, {
				variant: 'ghost',
				size: 'sm',
				get onclick() {
					return $$props.onback;
				},
				class: 'h-8 text-primary hover:text-primary/80',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_20 = $.first_child(fragment_4);

					Pencil(node_20, { class: 'mr-1 size-3.5' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var div_21 = $.child(div_20);
			var p_10 = $.child(div_21);
			var text_11 = $.child(p_10);
			var node_21 = $.sibling(text_11);

			{
				var consequent_6 = ($$anchor) => {
					var text_12 = $.text();

					$.template_effect(() => $.set_text(text_12, '(' + $.get(selectedShippingRate)?.estimated_min_days + ' - ' + $.get(selectedShippingRate)?.estimated_max_days + ' business days)'));
					$.append($$anchor, text_12);
				};

				var d = $.derived(() => !Number.isNaN(Number.parseFloat($.get(selectedShippingRate)?.estimated_min_days)) && !Number.isNaN(Number.parseFloat($.get(selectedShippingRate)?.estimated_max_days)));

				$.if(node_21, ($$render) => {
					if ($.get(d)) $$render(consequent_6);
				});
			}

			$.reset(p_10);

			var node_22 = $.sibling(p_10, 2);

			{
				var consequent_7 = ($$anchor) => {
					var p_11 = root_8();
					var text_13 = $.only_child(p_11, true);

					$.template_effect(() => $.set_text(text_13, $.get(selectedShippingRate).description));
					$.append($$anchor, p_11);
				};

				$.if(node_22, ($$render) => {
					if ($.get(selectedShippingRate).description) $$render(consequent_7);
				});
			}

			$.reset(div_21);

			var span = $.sibling(div_21, 2);
			var text_14 = $.only_child(span, true);

			$.reset(div_20);
			$.reset(div_18);

			$.template_effect(
				($0) => {
					$.set_text(text_11, `${$.get(selectedShippingRate).name ?? ''} `);
					$.set_text(text_14, $0);
				},
				[
					() => $.get(selectedShippingRate).base_rate > 0
						? formatPrice($.get(selectedShippingRate).base_rate, $.get(currencyCode))
						: 'FREE'
				]
			);

			$.append($$anchor, div_18);
		};

		$.if(node_17, ($$render) => {
			if ($.get(selectedShippingRate)) $$render(consequent_8);
		});
	}

	var div_22 = $.sibling(node_17, 2);
	var div_23 = $.child(div_22);
	var h2_4 = $.child(div_23);
	var node_23 = $.child(h2_4);

	CreditCard(node_23, { class: 'size-4 text-primary' });
	$.next();
	$.reset(h2_4);

	var node_24 = $.sibling(h2_4, 2);

	Button(node_24, {
		variant: 'ghost',
		size: 'sm',
		get onclick() {
			return $$props.onback;
		},
		class: 'h-8 text-primary hover:text-primary/80',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_25 = $.first_child(fragment_6);

			Pencil(node_25, { class: 'mr-1 size-3.5' });
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_23);

	var div_24 = $.sibling(div_23, 2);
	var node_26 = $.child(div_24);

	{
		var consequent_9 = ($$anchor) => {
			var div_25 = root_10();
			var img_1 = $.only_child(div_25);

			$.template_effect(() => {
				$.set_attribute(img_1, 'src', $.get(selectedPaymentMethod).img);
				$.set_attribute(img_1, 'alt', $.get(selectedPaymentMethod)?.name);
			});

			$.append($$anchor, div_25);
		};

		$.if(node_26, ($$render) => {
			if ($.get(selectedPaymentMethod)?.img) $$render(consequent_9);
		});
	}

	var span_1 = $.sibling(node_26, 2);
	var text_15 = $.only_child(span_1, true);

	$.reset(div_24);
	$.reset(div_22);
	$.reset(div_4);

	var div_26 = $.sibling(div_4, 2);
	var div_27 = $.child(div_26);
	var div_28 = $.sibling($.child(div_27), 2);
	var div_29 = $.child(div_28);
	var div_30 = $.child(div_29);
	var span_2 = $.sibling($.child(div_30), 2);
	var text_16 = $.only_child(span_2, true);

	$.reset(div_30);

	var node_27 = $.sibling(div_30, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_31 = root_11();
			var span_3 = $.child(div_31);
			var text_17 = $.only_child(span_3);
			var span_4 = $.sibling(span_3, 2);
			var text_18 = $.only_child(span_4);

			$.reset(div_31);

			$.template_effect(
				($0) => {
					$.set_text(text_17, `Discount ${cartState.cart.couponCode ? `(${cartState.cart.couponCode})` : ''}`);
					$.set_text(text_18, `- ${$0 ?? ''}`);
				},
				[
					() => formatPrice(cartState.cart.discountAmount, $.get(currencyCode))
				]
			);

			$.append($$anchor, div_31);
		};

		$.if(node_27, ($$render) => {
			if (cartState.cart.discountAmount > 0) $$render(consequent_10);
		});
	}

	var div_32 = $.sibling(node_27, 2);
	var node_28 = $.sibling($.child(div_32), 2);

	{
		var consequent_11 = ($$anchor) => {
			var span_5 = root_12();
			var text_19 = $.only_child(span_5, true);

			$.template_effect(($0) => $.set_text(text_19, $0), [
				() => formatPrice(cartState.cart.shippingCharges, $.get(currencyCode))
			]);

			$.append($$anchor, span_5);
		};

		var alternate = ($$anchor) => {
			var span_6 = root_13();

			$.append($$anchor, span_6);
		};

		$.if(node_28, ($$render) => {
			if (cartState.cart.shippingCharges) $$render(consequent_11); else $$render(alternate, -1);
		});
	}

	$.reset(div_32);
	$.reset(div_29);

	var div_33 = $.sibling(div_29, 2);
	var span_7 = $.sibling($.child(div_33), 2);
	var text_20 = $.only_child(span_7, true);

	$.reset(div_33);

	var node_29 = $.sibling(div_33, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_34 = root_14();
			var text_21 = $.only_child(div_34, true);

			$.template_effect(() => $.set_text(text_21, $$props.paymentModule.errorMessage));
			$.append($$anchor, div_34);
		};

		$.if(node_29, ($$render) => {
			if ($$props.paymentModule.showError) $$render(consequent_12);
		});
	}

	var div_35 = $.sibling(node_29, 2);
	var node_30 = $.child(div_35);

	LockKeyhole(node_30, { class: 'h-3.5 w-3.5 text-gray-400' });
	$.next(2);
	$.reset(div_35);

	var node_31 = $.sibling(div_35, 2);

	CheckoutButton(node_31, {
		text: 'Confirm Order',
		get onclick() {
			return $$props.onsubmit;
		},

		get disabled() {
			return $$props.paymentModule.checkoutDisabled;
		},

		get loading() {
			return $$props.paymentModule.paymentLoader;
		}
	});

	$.reset(div_28);
	$.reset(div_27);

	var node_32 = $.sibling(div_27, 2);

	OrderTrustBadges(node_32, {});
	$.reset(div_26);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `Items (${$.get(selectedItems).length ?? ''})`);
			$.set_text(text_15, $.get(selectedPaymentMethod)?.name || 'No payment method selected');
			$.set_text(text_16, $0);
			$.set_text(text_20, $1);
		},
		[
			() => formatPrice(cartState.cart.subtotal, $.get(currencyCode)),
			() => formatPrice(cartState.cart.total, $.get(currencyCode))
		]
	);

	$.append($$anchor, div);
	$.pop();
}